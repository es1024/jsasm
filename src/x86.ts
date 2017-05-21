import MemoryManager from './memory';
import SIGILL from './error/sigill';

export interface X86Registers {
  eax: number;
  ecx: number;
  edx: number;
  ebx: number;
  esp: number;
  ebp: number;
  esi: number;
  edi: number;
  eip: number;
  eflags: number;
}

export const enum X86Flag {
  CF = 0,
  PF = 2,
  AF = 4,
  ZF = 6,
  SF = 7,
  TF = 8,
  IF = 9,
  DF = 10,
  OF = 11,
}

const enum X86Reg {
  EAX = 0,
  ECX = 1,
  EDX = 2,
  EBX = 3,
  ESP = 4,
  EBP = 5,
  ESI = 6,
  EDI = 7,
  EIP = 8,
  EFLAGS = 9,
}

const ARITH_FLAG_CLEAR = ~((1 << <number>X86Flag.OF) | (1 << <number>X86Flag.SF) |
    (1 << <number>X86Flag.ZF) | (1 << <number>X86Flag.AF) |
    (1 << <number>X86Flag.PF) | (1 << <number>X86Flag.CF));

export default class X86 {
  private regs: Uint32Array;
  private mem: MemoryManager;

  constructor(mem: MemoryManager, regs: X86Registers) {
    this.mem = mem;
    this.regs = new Uint32Array(10);
    this.regs[<number> X86Reg.EAX] = regs.eax;
    this.regs[<number> X86Reg.ECX] = regs.ecx;
    this.regs[<number> X86Reg.EDX] = regs.edx;
    this.regs[<number> X86Reg.EBX] = regs.ebx;
    this.regs[<number> X86Reg.ESP] = regs.esp;
    this.regs[<number> X86Reg.EBP] = regs.ebp;
    this.regs[<number> X86Reg.ESI] = regs.esi;
    this.regs[<number> X86Reg.EDI] = regs.edi;
    this.regs[<number> X86Reg.EIP] = regs.eip;
    this.regs[<number> X86Reg.EFLAGS] = regs.eflags;

    this.add = this.add.bind(this);
    this.or = this.or.bind(this);
    this.adc = this.adc.bind(this);
    this.sbb = this.sbb.bind(this);
    this.and = this.and.bind(this);
    this.sub = this.sub.bind(this);
    this.xor = this.xor.bind(this);
  }

  getRegisters(): X86Registers {
    return {
      eax: this.regs[<number> X86Reg.EAX],
      ecx: this.regs[<number> X86Reg.ECX],
      edx: this.regs[<number> X86Reg.EDX],
      ebx: this.regs[<number> X86Reg.EBX],
      esp: this.regs[<number> X86Reg.ESP],
      ebp: this.regs[<number> X86Reg.EBP],
      esi: this.regs[<number> X86Reg.ESI],
      edi: this.regs[<number> X86Reg.EDI],
      eip: this.regs[<number> X86Reg.EIP],
      eflags: this.regs[<number> X86Reg.EFLAGS],
    };
  }

  setFlag(flag: X86Flag, value: boolean): void {
    if (value) {
      this.regs[<number> X86Reg.EFLAGS] |= (1 << <number>flag);
    } else {
      this.regs[<number> X86Reg.EFLAGS] &= ~(1 << <number>flag);
    }
  }

  getFlag(flag: X86Flag): boolean {
    return (this.regs[<number> X86Reg.EFLAGS] & (1 << <number>flag)) !== 0;
  }

  step(): void {
    const op = this.nextInstByte();
    const d = !!(op & 0x02);
    const w = !!(op & 0x01);
    switch (op >> 2) {
      case 0: this.processModRegRM(d, w, this.add); break;
      case 2: this.processModRegRM(d, w, this.or); break;
      case 4: this.processModRegRM(d, w, this.adc); break;
      case 6: this.processModRegRM(d, w, this.sbb); break;
      case 8: this.processModRegRM(d, w, this.and); break;
      case 10: this.processModRegRM(d, w, this.sub); break;
      case 12: this.processModRegRM(d, w, this.xor); break;
      default:
        throw new SIGILL('probably just unimplemented or something');
    }
  }

  private nextInstByte(): number {
    const tw = this.mem.readWord((this.regs[<number> X86Reg.EIP] >> 2) << 2);
    const offs = (~this.regs[<number> X86Reg.EIP]) & 0x3;
    const op = (tw >> (offs << 3)) & 0xFF;
    ++this.regs[<number> X86Reg.EIP];

    return op;
  }

  private processModRegRM(d: boolean, w: boolean,
      f: (a: number, b: number, w: boolean) => number): void {
    const modRM = this.nextInstByte();
    let reg = (modRM >> 3) & 0x7;
    let RM = modRM & 0x7;
    switch (modRM >> 6) {
      case 0:
      break;
      case 1:
      break;
      case 2:
      break;
      case 3:
        if (d) {
          const tmp = reg;
          reg = RM;
          RM = tmp;
        }
        if (w) {
          this.regs[RM] = f(this.regs[RM], this.regs[reg], w);
        } else {
          const RMr = RM & 0x3;
          const regr = reg & 0x3;
          const RMs = RM & 0x4;
          const regs = reg & 0x4;
          const tmp = f((this.regs[RMr] & (0xFF << RMs)) >> RMs,
              (this.regs[regr] & (0xFF << regs)) >> regs, w);
          this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
        }
      break;
    }
  }

  private parity(a: number): number {
    a ^= a >> 4;
    a &= 0xF;
    return (~(0x6996 >> a)) & 1;
  }

  private add(a: number, b: number, w: boolean): number {
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    return this.adc(a, b, w);
  }

  private or(a: number, b: number, w: boolean): number {
    const r = a | b;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << <number> X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << <number> X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << <number> X86Flag.PF;
    return r;
  }

  private adc(a: number, b: number, w: boolean): number {
    const cf = (this.regs[X86Reg.EFLAGS] >> (<number> X86Flag.CF)) & 1;
    const r = a + b + cf;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((a & n) == (b & n) && (a & n) != (r & n) ? 1 : 0)
        << <number> X86Flag.OF;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << <number> X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << <number> X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= ((a & 0xF) + (b & 0xF) + cf > 0xF ? 1 : 0)
        << <number> X86Flag.AF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << <number> X86Flag.PF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) != (r | 0) ? 1 : 0) << <number> X86Flag.CF;
    return r & m;
  }

  private sbb(a: number, b: number, w: boolean): number {
    this.regs[X86Reg.EFLAGS] ^= 1 << <number> X86Flag.CF;
    const r = this.adc(a, (w ? 0x100000000 : 0x100) - b, w);
    this.regs[X86Reg.EFLAGS] ^= 1 << <number> X86Flag.CF;
    return r;
  }

  private and(a: number, b: number, w: boolean): number {
    const r = a & b;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << <number> X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << <number> X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << <number> X86Flag.PF;
    return r;
  }

  private sub(a: number, b: number, w: boolean): number {
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    return this.sbb(a, b, w);
  }

  private xor(a: number, b: number, w: boolean): number {
    const r = a ^ b;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << <number> X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << <number> X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << <number> X86Flag.PF;
    return r;
  }
}

