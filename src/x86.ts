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
  es: number;
  cs: number;
  ss: number;
  ds: number;
  fs: number;
  gs: number;
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

const enum X86SReg {
  ES = 0,
  CS = 1,
  SS = 2,
  DS = 3,
  FS = 4,
  GS = 5,
}

const ARITH_FLAG_CLEAR = ~((1 << <number>X86Flag.OF) | (1 << <number>X86Flag.SF) |
    (1 << <number>X86Flag.ZF) | (1 << <number>X86Flag.AF) |
    (1 << <number>X86Flag.PF) | (1 << <number>X86Flag.CF));

export default class X86 {
  private regs: Uint32Array;
  private sregs: Uint16Array;
  private mem: MemoryManager;

  constructor(mem: MemoryManager, regs: X86Registers) {
    this.mem = mem;
    this.regs = new Uint32Array(10);
    this.regs[X86Reg.EAX] = regs.eax;
    this.regs[X86Reg.ECX] = regs.ecx;
    this.regs[X86Reg.EDX] = regs.edx;
    this.regs[X86Reg.EBX] = regs.ebx;
    this.regs[X86Reg.ESP] = regs.esp;
    this.regs[X86Reg.EBP] = regs.ebp;
    this.regs[X86Reg.ESI] = regs.esi;
    this.regs[X86Reg.EDI] = regs.edi;
    this.regs[X86Reg.EIP] = regs.eip;
    this.regs[X86Reg.EFLAGS] = regs.eflags;
    this.sregs = new Uint16Array(6);
    this.sregs[X86SReg.ES] = regs.es;
    this.sregs[X86SReg.CS] = regs.cs;
    this.sregs[X86SReg.SS] = regs.ss;
    this.sregs[X86SReg.DS] = regs.ds;
    this.sregs[X86SReg.FS] = regs.fs;
    this.sregs[X86SReg.GS] = regs.gs;

    this.add = this.add.bind(this);
    this.or = this.or.bind(this);
    this.adc = this.adc.bind(this);
    this.sbb = this.sbb.bind(this);
    this.and = this.and.bind(this);
    this.sub = this.sub.bind(this);
    this.xor = this.xor.bind(this);
    this.pushpop = this.pushpop.bind(this);
  }

  getRegisters(): X86Registers {
    return {
      eax: this.regs[X86Reg.EAX],
      ecx: this.regs[X86Reg.ECX],
      edx: this.regs[X86Reg.EDX],
      ebx: this.regs[X86Reg.EBX],
      esp: this.regs[X86Reg.ESP],
      ebp: this.regs[X86Reg.EBP],
      esi: this.regs[X86Reg.ESI],
      edi: this.regs[X86Reg.EDI],
      eip: this.regs[X86Reg.EIP],
      eflags: this.regs[X86Reg.EFLAGS],
      es: this.sregs[X86SReg.ES],
      cs: this.sregs[X86SReg.CS],
      ss: this.sregs[X86SReg.SS],
      ds: this.sregs[X86SReg.DS],
      fs: this.sregs[X86SReg.FS],
      gs: this.sregs[X86SReg.GS],
    };
  }

  setRegisters(regs: X86Registers): void {
    this.regs[X86Reg.EAX] = regs.eax;
    this.regs[X86Reg.ECX] = regs.ecx;
    this.regs[X86Reg.EDX] = regs.edx;
    this.regs[X86Reg.EBX] = regs.ebx;
    this.regs[X86Reg.ESP] = regs.esp;
    this.regs[X86Reg.EBP] = regs.ebp;
    this.regs[X86Reg.ESI] = regs.esi;
    this.regs[X86Reg.EDI] = regs.edi;
    this.regs[X86Reg.EIP] = regs.eip;
    this.regs[X86Reg.EFLAGS] = regs.eflags;
    this.sregs[X86SReg.ES] = regs.es;
    this.sregs[X86SReg.CS] = regs.cs;
    this.sregs[X86SReg.SS] = regs.ss;
    this.sregs[X86SReg.DS] = regs.ds;
    this.sregs[X86SReg.FS] = regs.fs;
    this.sregs[X86SReg.GS] = regs.gs;
  }

  setFlag(flag: X86Flag, value: boolean): void {
    if (value) {
      this.regs[X86Reg.EFLAGS] |= (1 << <number>flag);
    } else {
      this.regs[X86Reg.EFLAGS] &= ~(1 << <number>flag);
    }
  }

  getFlag(flag: X86Flag): boolean {
    return (this.regs[X86Reg.EFLAGS] & (1 << <number>flag)) !== 0;
  }

  step(): void {
    const op = this.nextInstByte();
    const d = !!(op & 0x02);
    const w = !!(op & 0x01);
    let tmp: number;
    switch (op >> 2) {
      case 0: this.processModRegRM(d, w, true, this.add); break;
      case 1:
        if (!d) {
          this.processImm(w, 0, true, this.add);
        } else {
          this.sregs[X86SReg.ES] = this.pushpop(this.sregs[X86SReg.ES], 0, w);
        }
      break;
      case 2: this.processModRegRM(d, w, true, this.or); break;
      case 3:
        if (!d) {
          this.processImm(w, 0, true, this.or);
        } else if (!w) {
          this.pushpop(this.sregs[X86SReg.CS], 0, false);
        } else {
          throw new SIGILL('multibyte ops not implemented');
        }
      break;
      case 4: this.processModRegRM(d, w, true, this.adc); break;
      case 5:
        if (!d) {
          this.processImm(w, 0, true, this.adc);
        } else {
          this.sregs[X86SReg.SS] = this.pushpop(this.sregs[X86SReg.SS], 0, w);
        }
      break;
      case 6: this.processModRegRM(d, w, true, this.sbb); break;
      case 7:
        if (!d) {
          this.processImm(w, 0, true, this.sbb);
        } else {
          this.sregs[X86SReg.DS] = this.pushpop(this.sregs[X86SReg.DS], 0, w);
        }
      break;
      case 8: this.processModRegRM(d, w, true, this.and); break;
      case 9:
        if (!d) {
          this.processImm(w, 0, true, this.and);
        } else {
          throw new SIGILL('unimplemented');
        }
      break;
      case 10: this.processModRegRM(d, w, true, this.sub); break;
      case 11:
        if (!d) {
          this.processImm(w, 0, true, this.sub);
        } else {
          throw new SIGILL('unimplemented');
        }
      break;
      case 12: this.processModRegRM(d, w, true, this.xor); break;
      case 13:
        if (!d) {
          this.processImm(w, 0, true, this.xor);
        } else {
          throw new SIGILL('unimplemented');
        }
      break;
      case 14: this.processModRegRM(d, w, false, this.sub); break;
      case 15:
        if (!d) {
          this.processImm(w, 0, false, this.sub);
        } else {
          throw new SIGILL('unimplemented');
        }
      break;
      case 16:
      case 17:
        tmp = this.regs[X86Reg.EFLAGS] & (1 << X86Flag.CF);
        this.regs[op & 0x7] = this.add(this.regs[op & 0x7], 1, true);
        this.regs[X86Reg.EFLAGS] |= tmp;
      break;
      case 18:
      case 19:
        tmp = this.regs[X86Reg.EFLAGS] & (1 << X86Flag.CF);
        this.regs[op & 0x7] = this.sub(this.regs[op & 0x7], 1, true);
        this.regs[X86Reg.EFLAGS] |= tmp;
      break;
      case 20:
      case 21:
      case 22:
      case 23:
        this.regs[op & 0x7] = this.pushpop(this.regs[op & 0x7], 0, op >= 0x58);
      break;
      case 32:
        if (!d) {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.OF)) != 0);
        } else {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.CF)) != 0);
        }
      break;
      case 33:
        if (!d) {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.ZF)) != 0);
        } else {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & ((1 << X86Flag.CF) |
              (1 << X86Flag.ZF))) != 0);
        }
      break;
      case 34:
        if (!d) {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.SF)) != 0);
        } else {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.PF)) != 0);
        }
      break;
      case 35:
        if (!d) {
          this.processJump(w, ((this.regs[X86Reg.EFLAGS] & (1 << X86Flag.SF)) == 0)
              != ((this.regs[X86Reg.EFLAGS] & (1 << X86Flag.OF)) == 0));
        } else {
          this.processJump(w, (this.regs[X86Reg.EFLAGS] & (1 << X86Flag.ZF)) != 0
              || ((this.regs[X86Reg.EFLAGS] & (1 << X86Flag.SF)) == 0)
              != ((this.regs[X86Reg.EFLAGS] & (1 << X86Flag.OF)) == 0));
        }
      break;
      case 36:
        if (!d && !w) {
          break;
        }
      default:
        throw new SIGILL('probably just unimplemented or something');
    }
  }

  private nextInstByte(): number {
    const tw = this.mem.readWord(this.regs[X86Reg.EIP] & ~0x3);
    const offs = this.regs[X86Reg.EIP] & 0x3;
    const op = (tw >> (offs << 3)) & 0xFF;
    ++this.regs[X86Reg.EIP];

    return op;
  }

  private processModRegRM(d: boolean, w: boolean, k: boolean,
      f: (a: number, b: number, w: boolean) => number): void {
    const modRM = this.nextInstByte();
    const mod = modRM >> 6;
    let reg = (modRM >> 3) & 0x7;
    let RM = modRM & 0x7;
    let offset = 0;
    let scale = 1;
    let index = 0;
    let base = RM;
    let addr = 0;
    if (mod < 3 && RM == 5) {
      const SIB = this.nextInstByte();
      scale = SIB >> 6;
      index = (SIB >> 3) & 0x7;
      base = SIB & 0x7;
      if (base == 5) {
        throw new SIGILL('SIB base=5');
      }
    }
    switch (mod) {
      case 2:
        offset |= this.nextInstByte();
        offset |= this.nextInstByte() << 8;
        offset |= this.nextInstByte() << 16;
      case 1:
        offset |= this.nextInstByte() << 24;
        if (mod == 1) {
          offset >>= 24;
        }
      case 0:
        if (base == 6 && mod == 0) {
          addr |= this.nextInstByte();
          addr |= this.nextInstByte() << 8;
          addr |= this.nextInstByte() << 16;
          addr |= this.nextInstByte() << 24;
        } else {
          addr = this.regs[base] + offset;
        }
        if (RM == 5) {
          addr += index << scale;
        }
        addr &= 0xFFFFFFFF;

        let memVal = 0;
        let memA = 0, memB = 0, maskTop = 0, maskBottom = 0, cTop = 0, cBottom = 0;
        if ((addr & 0x3) == 0) {
          memVal = this.mem.readWord(addr);
        } else {
          cTop = ((~addr) & 0x3) << 3;
          cBottom = (addr & 0x3) << 3;
          maskBottom = (1 << cBottom) - 1;
          maskTop = ~maskBottom;
          memA = this.mem.readWord(addr & ~0x3);
          memB = this.mem.readWord((addr & ~0x3) + 4);
          memVal = memB & maskBottom;
          memVal <<= cTop;
          memVal &= memA >> cBottom;
        }

        if (d) {
          const v = f(this.regs[reg], memVal, w);
          if (k) {
            this.regs[reg] = v;
          }
        } else {
          const v = f(memVal, this.regs[reg], w);
          if (k) {
            if ((addr & 0x3) == 0) {
              this.mem.writeWord(addr, v);
            } else {
              memA &= maskBottom;
              memB &= maskTop;
              memA |= (v & ((1 << cTop) - 1)) << cBottom;
              memB |= (v & ~((1 << cTop) - 1));
              this.mem.writeWord(addr & ~0x3, memA);
              this.mem.writeWord((addr & ~0x3) + 4, memB);
            }
          }
        }
      break;
      case 3:
        if (d) {
          const tmp = reg;
          reg = RM;
          RM = tmp;
        }
        if (w) {
          const v = f(this.regs[RM], this.regs[reg], w);
          if (k) {
            this.regs[RM] = v;
          }
        } else {
          const RMr = RM & 0x3;
          const regr = reg & 0x3;
          const RMs = RM & 0x4;
          const regs = reg & 0x4;
          const tmp = f((this.regs[RMr] & (0xFF << RMs)) >> RMs,
              (this.regs[regr] & (0xFF << regs)) >> regs, w);
          if (k) {
            this.regs[RMr] = (this.regs[RMr] & ~(0xFF << RMs)) | tmp << RMs;
          }
        }
      break;
    }
  }

  private processImm(w: boolean, reg: number, k: boolean,
      f: (a: number, b: number, w: boolean) => number): void {
    if (w) {
      let imm = this.nextInstByte();
      imm |= this.nextInstByte() << 8;
      imm |= this.nextInstByte() << 16;
      imm |= this.nextInstByte() << 24;
      let v = f(this.regs[reg], imm, w);
      if (k) {
        this.regs[reg] = v;
      }
    } else {
      const imm = this.nextInstByte();
      const regr = reg & 0x3;
      const regs = reg & 0x4;
      const tmp = f((this.regs[regr] & (0xFF << regs)) >> regs, imm, w);
      if (k) {
        this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
      }
    }
  }

  private processJump(negate: boolean, cond: boolean): void {
    let offset: number;
    offset = this.nextInstByte();
    if (offset > 127) {
      offset -= 256;
    }
    if (negate != cond) {
      this.regs[X86Reg.EIP] += offset;
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
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << X86Flag.PF;
    return r;
  }

  private adc(a: number, b: number, w: boolean): number {
    const cf = (this.regs[X86Reg.EFLAGS] >> (X86Flag.CF)) & 1;
    const r = a + b + cf;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((a & n) == (b & n) && (a & n) != (r & n) ? 1 : 0)
        << X86Flag.OF;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= ((a & 0xF) + (b & 0xF) + cf > 0xF ? 1 : 0)
        << X86Flag.AF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << X86Flag.PF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) != (r | 0) ? 1 : 0) << X86Flag.CF;
    return r & m;
  }

  private sbb(a: number, b: number, w: boolean): number {
    this.regs[X86Reg.EFLAGS] ^= 1 << X86Flag.CF;
    const r = this.adc(a, (w ? 0x100000000 : 0x100) - b, w);
    this.regs[X86Reg.EFLAGS] ^= 1 << X86Flag.CF;
    return r;
  }

  private and(a: number, b: number, w: boolean): number {
    const r = a & b;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << X86Flag.PF;
    return r;
  }

  private sub(a: number, b: number, w: boolean): number {
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= 1 << X86Flag.CF;
    return this.sbb(a, b, w);
  }

  private xor(a: number, b: number, w: boolean): number {
    const r = a ^ b;
    const m = w ? 0xFFFFFFFF : 0xFF;
    const n = w ? 0x80000000 : 0x80;
    this.regs[X86Reg.EFLAGS] &= ARITH_FLAG_CLEAR;
    this.regs[X86Reg.EFLAGS] |= ((r & n) != 0 ? 1 : 0) << X86Flag.SF;
    this.regs[X86Reg.EFLAGS] |= ((r & m) == 0 ? 1 : 0) << X86Flag.ZF;
    this.regs[X86Reg.EFLAGS] |= this.parity(a) << X86Flag.PF;
    return r;
  }

  private pushpop(a: number, _: number, pop: boolean): number {
    if (!pop) {
      this.regs[X86Reg.ESP] -= 4;
      if ((this.regs[X86Reg.ESP] & 0x3) == 0) {
        this.mem.writeWord(this.regs[X86Reg.ESP], a);
      }
      return a;
    } else {
      let value = 0;
      if ((this.regs[X86Reg.ESP] & 0x3) == 0) {
        value = this.mem.readWord(this.regs[X86Reg.ESP]);
      }
      this.regs[X86Reg.ESP] += 4;
      return value;
    }
  }
}

