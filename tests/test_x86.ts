import * as Suite from 'testjs';

import {TEXT_MASK, STACK_MASK} from '../src/address';
import MemoryManager from '../src/memory';
import SIGBASE from '../src/error/sigbase';
import SIGILL from '../src/error/sigill';
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

const REG8 = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
const REG16 = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'];
const REG32 = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi'];

function prepareX86(text: number[], stack?: number[], regs?: X86RegistersOpt,
    textLength?: number, stackLength?: number): X86 {
  const mem = new MemoryManager({
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
function annotatedTestEqualHex(test: any, a: number, b: number, pfx: string) {
  a = ((a | 0) + 4294967296) % 4294967296;
  b = ((b | 0) + 4294967296) % 4294967296;
  test.equal(a, b, pfx + ' expected=' + b.toString(16) + ' actual='
      + a.toString(16));
}
function getReg8(regs: X86RegistersOpt, reg: number): number {
  switch (reg) {
    case 0: return regs.eax & 0xFF;
    case 1: return regs.ecx & 0xFF;
    case 2: return regs.edx & 0xFF;
    case 3: return regs.ebx & 0xFF;
    case 4: return (regs.eax >> 8) & 0xFF;
    case 5: return (regs.ecx >> 8) & 0xFF;
    case 6: return (regs.edx >> 8) & 0xFF;
    case 7: return (regs.ebx >> 8) & 0xFF;
    default: throw new Error('bad register #: ' + reg);
  }
}
function getReg32(regs: X86RegistersOpt, reg: number): number {
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
function compareRegs(test: any, x86: X86, regs: X86RegistersOpt, e?: string): void {
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
function setRegs(x86: X86, regs: X86RegistersOpt): void {
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
function assignReg8(regs: X86RegistersOpt, reg: number, val: number): void {
  let mask = 0xFFFFFF00;
  val &= 0xFF;
  if (reg & 0x4) {
    val <<= 8;
    mask = 0xFFFF00FF;
  }
  switch (reg & 0x3) {
    case 0: regs.eax = regs.eax & mask | val; break;
    case 1: regs.ecx = regs.ecx & mask | val; break;
    case 2: regs.edx = regs.edx & mask | val; break;
    case 3: regs.ebx = regs.ebx & mask | val; break;
  }
}
function assignReg32(regs: X86RegistersOpt, reg: number, val: number): void {
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

Suite.run({
  'single byte instruction extraction': function(test: any): void {
    let x86: X86;
    let text = Array(256).fill(0xFF);
    let step = () => { x86.step(); };

    x86 = prepareX86(text);
    let initEIP = x86.getRegisters().eip;
    test.throws(step, SIGILL);

    for (let i = 0; i < 255; ++i) {
      text[i] = 0x90;
      if (i > 0) {
        test[i - 1] = 0xFF;
      }
      x86 = prepareX86(text, undefined, { eip: initEIP });
      test.doesNotThrow(step);
      test.equal(x86.getRegisters().eip, ++initEIP);
      test.throws(step, SIGILL);
    }

    test.done();
  },
  'mod/reg/rm reg8': function(test: any): void {
    let regs = {
      eax: 0xDEAD1001,
      ecx: 0xDEAD2002,
      edx: 0xDEAD4004,
      ebx: 0xDEAD8008,
    };
    let text = Array(128).fill(0x28); // sub r/m8, r8 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0xC0 | i;
    }

    let x86 = prepareX86(text, undefined, regs);
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        x86.step();
        let expected = {...regs};
        assignReg8(expected, j, (1 << j) - (1 << i));
        compareRegs(test, x86, expected, 'sub ' + REG8[j] + ', ' + REG8[i] + ':');
        setRegs(x86, regs);
      }
    }
    test.done();
  },
  'mod/reg/rm reg32': function(test: any): void {
    let regs = {
      eax: 0x01,
      ecx: 0x02,
      edx: 0x04,
      ebx: 0x08,
      esp: 0x10,
      ebp: 0x20,
      esi: 0x40,
      edi: 0x80,
    };
    let text = Array(128).fill(0x29); // sub r/m32, r32 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0xC0 | i;
    }

    let x86 = prepareX86(text, undefined, regs);
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        x86.step();
        let expected = {...regs};
        assignReg32(expected, j, (1 << j) - (1 << i));
        compareRegs(test, x86, expected, 'sub ' + REG32[j] + ', ' + REG32[i] + ':');
        setRegs(x86, regs);
      }
    }
    test.done();
  },
  'mod/reg/rm reg8+direction': function(test: any): void {
    let regs = {
      eax: 0xDEAD1001,
      ecx: 0xDEAD2002,
      edx: 0xDEAD4004,
      ebx: 0xDEAD8008,
    };
    let text = Array(128).fill(0x2A); // sub r8, r/m8 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0xC0 | i;
    }

    let x86 = prepareX86(text, undefined, regs);
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        x86.step();
        let expected = {...regs};
        assignReg8(expected, i, (1 << i) - (1 << j));
        compareRegs(test, x86, expected, 'sub ' + REG8[i] + ', ' + REG8[j] + ':');
        setRegs(x86, regs);
      }
    }
    test.done();
  },
  'mod/reg/rm reg32+direction': function(test: any): void {
    let regs = {
      eax: 0x01,
      ecx: 0x02,
      edx: 0x04,
      ebx: 0x08,
      esp: 0x10,
      ebp: 0x20,
      esi: 0x40,
      edi: 0x80,
    };
    let text = Array(128).fill(0x2B); // sub r32, r/m32 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0xC0 | i;
    }

    let x86 = prepareX86(text, undefined, regs);
    const rn = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi'];
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        x86.step();
        let expected = {...regs};
        assignReg32(expected, i, (1 << i) - (1 << j));
        compareRegs(test, x86, expected, 'sub ' + REG32[i] + ', ' + REG32[j] + ':');
        setRegs(x86, regs);
      }
    }
    test.done();
  },
  'mod/reg/rm b8 mod 00': function(test: any): void {
    let regs = {
      eax: 0x0110 | STACK_MASK,
      ecx: 0x0220 | STACK_MASK,
      edx: 0x0440 | STACK_MASK,
      ebx: 0x0880 | STACK_MASK,
      esi: 0x0000 | STACK_MASK,
      edi: 0x0004 | STACK_MASK,
    };
    let text = Array(128).fill(0x28); // sub r/m8, r8 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0x00 | i;
    }
    let stack = Array(65536);
    for (let i = 0; i < 65536; ++i) {
      stack[i] = (i >> 2) & 0xFF;
    }
    let x86 = prepareX86(text, stack, regs, undefined, 65536);
    let mem = x86.getMemoryManager();
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if (j == 4 || j == 5) {
          const cregs = x86.getRegisters();
          cregs.eip += 2;
          // skip SIB and [disp] instructions
          x86.setRegisters(cregs);
          continue;
        }
        const tname = 'sub byte [' + REG32[j] + '], ' + REG8[i] + ':';
        x86.step();
        compareRegs(test, x86, regs, tname);

        const original = ((getReg32(regs, j) & 0xFFFF) >> 2) & 0xFF;
        const expected = (original - getReg8(regs, i)) & 0xFF;
        const actual = mem.readWord(getReg32(regs, j)) & 0xFF;
        annotatedTestEqualHex(test, actual, expected, tname);
        mem.writeWord(getReg32(regs, j), original | original << 8 | original << 16
            | original << 24);
      }
    }
    test.done();
  },
  'mod/reg/rm b32 mod 00': function(test: any): void {
    let regs = {
      eax: 0x0110 | STACK_MASK,
      ecx: 0x0220 | STACK_MASK,
      edx: 0x0440 | STACK_MASK,
      ebx: 0x0880 | STACK_MASK,
      esp: 0x3030 | STACK_MASK,
      ebp: 0x5050 | STACK_MASK,
      esi: 0x0000 | STACK_MASK,
      edi: 0x0004 | STACK_MASK,
    };
    let text = Array(128).fill(0x29); // sub r/m32, r32 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0x00 | i;
    }
    let stack = Array(65536);
    for (let i = 0; i < 65536; ++i) {
      stack[i] = (i >> 2) & 0xFF;
    }
    let x86 = prepareX86(text, stack, regs, undefined, 65536);
    let mem = x86.getMemoryManager();
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if (j == 4 || j == 5) {
          const cregs = x86.getRegisters();
          cregs.eip += 2;
          // skip SIB and [disp] instructions
          x86.setRegisters(cregs);
          continue;
        }
        const tname = 'sub dword [' + REG32[j] + '], ' + REG32[i] + ':';
        x86.step();
        compareRegs(test, x86, regs, tname);

        let original = ((getReg32(regs, j) & 0xFFFF) >> 2) & 0xFF;
        original |= original << 8 | original << 16 | original << 24;
        const expected = original - getReg32(regs, i);
        const actual = mem.readWord(getReg32(regs, j));
        annotatedTestEqualHex(test, actual, expected, tname);
        mem.writeWord(getReg32(regs, j), original);
      }
    }
    test.done();
  },
  'mod/reg/rm b8 mod 00 direction': function(test: any): void {
    let regs = {
      eax: 0x0110 | STACK_MASK,
      ecx: 0x0220 | STACK_MASK,
      edx: 0x0440 | STACK_MASK,
      ebx: 0x0880 | STACK_MASK,
      esi: 0x0000 | STACK_MASK,
      edi: 0x0004 | STACK_MASK,
    };
    let text = Array(128).fill(0x2A); // sub r8, r/m8 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0x00 | i;
    }
    let stack = Array(65536);
    for (let i = 0; i < 65536; ++i) {
      stack[i] = (i >> 2) & 0xFF;
    }
    let x86 = prepareX86(text, stack, regs, undefined, 65536);
    let mem = x86.getMemoryManager();
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if (j == 4 || j == 5) {
          const cregs = x86.getRegisters();
          cregs.eip += 2;
          // skip SIB and [disp] instructions
          x86.setRegisters(cregs);
          continue;
        }
        const tname = 'sub ' + REG8[i] + ', byte [' + REG32[i] + ']:';
        x86.step();
        const memory = ((getReg32(regs, j) & 0xFFFF) >> 2) & 0xFF;
        const expected = {...regs};
        assignReg8(expected, i, (getReg8(regs, i) - memory) & 0xFF);
        compareRegs(test, x86, expected, tname);
        setRegs(x86, regs);
      }
    }
    test.done();
  },
  'mod/reg/rm b32 mod 00 direction': function(test: any): void {
    let regs = {
      eax: 0x0110 | STACK_MASK,
      ecx: 0x0220 | STACK_MASK,
      edx: 0x0440 | STACK_MASK,
      ebx: 0x0880 | STACK_MASK,
      esp: 0x3030 | STACK_MASK,
      ebp: 0x5050 | STACK_MASK,
      esi: 0x0000 | STACK_MASK,
      edi: 0x0004 | STACK_MASK,
    };
    let text = Array(128).fill(0x2B); // sub r32, r/m32 to also check direction
    for (let i = 0; i < 64; ++i) {
      text[2 * i + 1] = 0x00 | i;
    }
    let stack = Array(65536);
    for (let i = 0; i < 65536; ++i) {
      stack[i] = (i >> 2) & 0xFF;
    }
    let x86 = prepareX86(text, stack, regs, undefined, 65536);
    let mem = x86.getMemoryManager();
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if (j == 4 || j == 5) {
          const cregs = x86.getRegisters();
          cregs.eip += 2;
          // skip SIB and [disp] instructions
          x86.setRegisters(cregs);
          continue;
        }
        const tname = 'sub ' + REG32[i] + ', dword [' + REG32[j] + ']:';
        x86.step();

        let memory = ((getReg32(regs, j) & 0xFFFF) >> 2) & 0xFF;
        memory |= memory << 8 | memory << 16 | memory << 24;
        const expected = {...regs};
        assignReg32(expected, i, getReg32(regs, i) - memory);
        compareRegs(test, x86, expected, tname);
        setRegs(x86, regs);
      }
    }
    test.done();
  },
});

