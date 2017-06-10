import {getAddressOffset, isStackAddress} from '../src/address';
import {TEXT_MASK, STACK_MASK} from '../src/address';
import MemoryManager from '../src/memory';
import X86, {X86Flag, X86Registers} from '../src/x86';

export interface X86RegistersOpt {
  eax?: number;
  ecx?: number;
  edx?: number;
  ebx?: number;
  esp?: number;
  ebp?: number;
  esi?: number;
  edi?: number;
  eip?: number;
  eflags?: number;
  es?: number;
  cs?: number;
  ss?: number;
  ds?: number;
  fs?: number;
  gs?: number;
}

export const REG8 = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
export const REG16 = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'];
export const REG32 = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi'];
export const FLAGS = ['CF', '', 'PF', '', 'AF', '', 'ZF', 'SF', 'TF', 'IF',
    'DF', 'OF'];
export function hash(addr: number): number {
  addr = (addr ^ 61) ^ (addr >> 16);
  addr = (addr + (addr << 3)) & 0xFFFFFFFF;
  addr = addr ^ (addr >> 4);
  addr = (addr * 0x27d4eb2d) & 0xFFFFFFFF;
  addr = addr ^ (addr >> 15);
  return (addr >> 11) & 0xFF;
}

export class CircularStackMemoryManager extends MemoryManager {
  private written: {[addr: number]: number} = {};
  readWord(addr: number): number {
    if (isStackAddress(addr)) {
      let rv: number;

      if (typeof this.written[addr] !== 'undefined') {
        rv = this.written[addr];
      } else {
        rv = hash(addr) | hash(addr + 1) << 8 | hash(addr + 2) << 16 |
            hash(addr + 3) << 24;
      }
      return rv;
    }
    return super.readWord(addr);
  }
  writeWord(addr: number, value: number): void {
    if (isStackAddress(addr)) {
      this.written[addr] = value;
      return;
    }
    super.writeWord(addr, value);
  }
  anyWrites(): boolean {
    return Object.keys(this.written).length != 0;
  }
}

export function prepareX86(text: number[], stack?: number[], regs?: X86RegistersOpt,
    textLength?: number, stackLength?: number): X86 {
  const mem = new (stackLength ? MemoryManager : CircularStackMemoryManager)({
    textLength: textLength || 256,
    stackLength: stackLength || 256,
  });
  if (typeof regs === 'undefined') { regs = {}; }
  regs = {...regs};
  if (typeof regs.eax === 'undefined') { regs.eax = 0; }
  if (typeof regs.ecx === 'undefined') { regs.ecx = 0; }
  if (typeof regs.edx === 'undefined') { regs.edx = 0; }
  if (typeof regs.ebx === 'undefined') { regs.ebx = 0; }
  if (typeof regs.esp === 'undefined') { regs.esp = mem.getStackTopAddr(); }
  if (typeof regs.ebp === 'undefined') { regs.ebp = 0; }
  if (typeof regs.esi === 'undefined') { regs.esi = 0; }
  if (typeof regs.edi === 'undefined') { regs.edi = 0; }
  if (typeof regs.eip === 'undefined') { regs.eip = mem.getTextBaseAddr(); }
  if (typeof regs.eflags === 'undefined') {
    regs.eflags = (1 << 1) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 15);
  }
  if (typeof regs.es === 'undefined') { regs.es = 0; }
  if (typeof regs.cs === 'undefined') { regs.cs = 0; }
  if (typeof regs.ss === 'undefined') { regs.ss = 0; }
  if (typeof regs.ds === 'undefined') { regs.ds = 0; }
  if (typeof regs.fs === 'undefined') { regs.fs = 0; }
  if (typeof regs.gs === 'undefined') { regs.gs = 0; }

  for (let i = 0; i < text.length; i += 4) {
    let value = 0;
    for (let j = 0; j < 4 && i + j < text.length; ++j) {
      value |= text[i + j] << (j << 3);
    }
    mem.writeWord(TEXT_MASK | i, value);
  }

  if (stack) {
    for (let i = 0; i < stack.length; i += 4) {
      let value = 0;
      for (let j = 0; j < 4 && i + j < stack.length; ++j) {
        value |= stack[i + j] << (j << 3);
      }
      mem.writeWord(STACK_MASK | i, value);
    }
  }

  return new X86(mem, <X86Registers> regs);
}
export function annotatedTestEqualHex(test: any, a: number, b: number, pfx: string) {
  a = ((a | 0) + 4294967296) % 4294967296;
  b = ((b | 0) + 4294967296) % 4294967296;
  test.equal(a, b, pfx + ' expected=' + b.toString(16) + ' actual='
      + a.toString(16));
}
export function getReg8(regs: X86RegistersOpt, reg: number): number {
  switch (reg) {
    case 0: return regs.eax & 0xFF;
    case 1: return regs.ecx & 0xFF;
    case 2: return regs.edx & 0xFF;
    case 3: return regs.ebx & 0xFF;
    case 4: return (regs.eax >>> 8) & 0xFF;
    case 5: return (regs.ecx >>> 8) & 0xFF;
    case 6: return (regs.edx >>> 8) & 0xFF;
    case 7: return (regs.ebx >>> 8) & 0xFF;
    default: throw new Error('bad register #: ' + reg);
  }
}
export function getReg32(regs: X86RegistersOpt, reg: number): number {
  switch (reg) {
    case 0: return regs.eax;
    case 1: return regs.ecx;
    case 2: return regs.edx;
    case 3: return regs.ebx;
    case 4: return regs.esp;
    case 5: return regs.ebp;
    case 6: return regs.esi;
    case 7: return regs.edi;
    default: throw new Error('bad register #: ' + reg);
  }
}
export function compareRegs(test: any, x86: X86, regs: X86RegistersOpt,
    e?: string): void {
  let aregs = x86.getRegisters();
  let cmp = (a: number, b: number, name: string): void => {
    annotatedTestEqualHex(test, a, b, (e || '') + ' reg=' + name);
  };
  if (typeof regs.eax !== 'undefined') { cmp(aregs.eax, regs.eax, 'eax'); }
  if (typeof regs.ecx !== 'undefined') { cmp(aregs.ecx, regs.ecx, 'ecx'); }
  if (typeof regs.edx !== 'undefined') { cmp(aregs.edx, regs.edx, 'edx'); }
  if (typeof regs.ebx !== 'undefined') { cmp(aregs.ebx, regs.ebx, 'ebx'); }
  if (typeof regs.esp !== 'undefined') { cmp(aregs.esp, regs.esp, 'esp'); }
  if (typeof regs.ebp !== 'undefined') { cmp(aregs.ebp, regs.ebp, 'ebp'); }
  if (typeof regs.esi !== 'undefined') { cmp(aregs.esi, regs.esi, 'esi'); }
  if (typeof regs.edi !== 'undefined') { cmp(aregs.edi, regs.edi, 'edi'); }
  if (typeof regs.eip !== 'undefined') { cmp(aregs.eip, regs.eip, 'eip'); }
  if (typeof regs.eflags !== 'undefined') {
    cmp(aregs.eflags, regs.eflags, 'eflags');
  }
  if (typeof regs.es !== 'undefined') { cmp(aregs.es, regs.es, 'es'); }
  if (typeof regs.cs !== 'undefined') { cmp(aregs.cs, regs.cs, 'cs'); }
  if (typeof regs.ss !== 'undefined') { cmp(aregs.ss, regs.ss, 'ss'); }
  if (typeof regs.ds !== 'undefined') { cmp(aregs.ds, regs.ds, 'ds'); }
  if (typeof regs.fs !== 'undefined') { cmp(aregs.fs, regs.fs, 'fs'); }
  if (typeof regs.gs !== 'undefined') { cmp(aregs.gs, regs.gs, 'gs'); }
}
export function setRegs(x86: X86, regs: X86RegistersOpt): void {
  let cregs = x86.getRegisters();
  if (typeof regs.eax !== 'undefined') { cregs.eax = regs.eax; }
  if (typeof regs.ecx !== 'undefined') { cregs.ecx = regs.ecx; }
  if (typeof regs.edx !== 'undefined') { cregs.edx = regs.edx; }
  if (typeof regs.ebx !== 'undefined') { cregs.ebx = regs.ebx; }
  if (typeof regs.esp !== 'undefined') { cregs.esp = regs.esp; }
  if (typeof regs.ebp !== 'undefined') { cregs.ebp = regs.ebp; }
  if (typeof regs.esi !== 'undefined') { cregs.esi = regs.esi; }
  if (typeof regs.edi !== 'undefined') { cregs.edi = regs.edi; }
  if (typeof regs.eip !== 'undefined') { cregs.eip = regs.eip; }
  if (typeof regs.eflags !== 'undefined') { cregs.eflags = regs.eflags; }
  if (typeof regs.es !== 'undefined') { cregs.es = regs.es; }
  if (typeof regs.cs !== 'undefined') { cregs.cs = regs.cs; }
  if (typeof regs.ss !== 'undefined') { cregs.ss = regs.ss; }
  if (typeof regs.ds !== 'undefined') { cregs.ds = regs.ds; }
  if (typeof regs.fs !== 'undefined') { cregs.fs = regs.fs; }
  if (typeof regs.gs !== 'undefined') { cregs.gs = regs.gs; }
  x86.setRegisters(cregs);
}
export function assignReg8(regs: X86RegistersOpt, reg: number, val: number): void {
  let mask = 0xFFFFFF00;
  val &= 0xFF;
  if (reg & 0x4) {
    val <<= 8;
    mask = 0xFFFF00FF;
  }
  switch (reg & 0x3) {
    case 0: regs.eax = (regs.eax || 0) & mask | val; break;
    case 1: regs.ecx = (regs.ecx || 0) & mask | val; break;
    case 2: regs.edx = (regs.edx || 0) & mask | val; break;
    case 3: regs.ebx = (regs.ebx || 0) & mask | val; break;
  }
}
export function assignReg32(regs: X86RegistersOpt, reg: number, val: number): void {
  val &= 0xFFFFFFFF;
  switch (reg) {
    case 0: regs.eax = val; break;
    case 1: regs.ecx = val; break;
    case 2: regs.edx = val; break;
    case 3: regs.ebx = val; break;
    case 4: regs.esp = val; break;
    case 5: regs.ebp = val; break;
    case 6: regs.esi = val; break;
    case 7: regs.edi = val; break;
  }
}

export function flagArrayToRegister(flags: X86Flag[]): number {
  let res = 0;
  flags.forEach(flag => { res |= 1 << flag; });
  return res;
}
export function flagStrToArray(fstr: string): X86Flag[] {
  const res: X86Flag[] = [];
  const map = {
    'c': X86Flag.CF,
    'p': X86Flag.PF,
    'a': X86Flag.AF,
    'z': X86Flag.ZF,
    's': X86Flag.SF,
    't': X86Flag.TF,
    'i': X86Flag.IF,
    'd': X86Flag.DF,
    'o': X86Flag.OF,
  };
  for (let i = fstr.length; i-- > 0; ) {
    res.push(map[fstr.charAt(i)]);
  }
  return res;
}

export function testInst(test: any, text: number[], ireg: X86RegistersOpt,
    oreg: X86RegistersOpt, iflags: string, oflags?: string, skip?: string): void {
  if (typeof skip === 'undefined') {
    skip = 'tid';
  }
  const askip = flagStrToArray(skip);
  if (iflags.length > 0) {
    ireg.eflags = flagArrayToRegister(flagStrToArray(iflags));
  }
  const inputs = 'input=' +
          JSON.stringify(ireg) + ', output=' + JSON.stringify(oreg) +
          ', iflags=' + iflags;
  const x86 = prepareX86(text, undefined, ireg, (text.length + 3) & ~0x3);
  x86.step();
  compareRegs(test, x86, oreg, inputs);

  if (typeof oflags !== 'undefined') {
    const aoflag = flagStrToArray(oflags);
    const checkFlag = flag => {
      if (askip.indexOf(flag) >= 0) {
        return;
      }
      const chk = aoflag.indexOf(flag) >= 0 ? test.ok : test.notOk;
      const str = aoflag.indexOf(flag) >= 0 ? 'set' : 'unset';
      const tstr = FLAGS[flag] + ' should be ' + str + ' for ' + inputs;
      chk(x86.getFlag(flag), tstr);
    };
    checkFlag(X86Flag.CF);
    checkFlag(X86Flag.PF);
    checkFlag(X86Flag.AF);
    checkFlag(X86Flag.ZF);
    checkFlag(X86Flag.SF);
    checkFlag(X86Flag.TF);
    checkFlag(X86Flag.IF);
    checkFlag(X86Flag.DF);
    checkFlag(X86Flag.OF);
  }
}

