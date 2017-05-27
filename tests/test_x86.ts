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

function prepareX86(text: number[], stack?: number[], regs?: X86RegistersOpt): X86 {
  const mem = new MemoryManager({
    textLength: 256,
    stackLength: 256,
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

function compareRegs(test: any, x86: X86, regs: X86RegistersOpt, e?: string): void {
  let aregs = x86.getRegisters();
  let cmp = (a, b, name) => {
    a = ((a | 0) + 4294967296) % 4294967296;
    b = ((b | 0) + 4294967296) % 4294967296;
    test.equal(a, b, (e || '') + ' reg=' + name + ' expected='
        + b.toString(16) + ' actual=' + a.toString(16));
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
    const rn = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        x86.step();

        let expectedOut = ((1 << j) - (1 << i)) & 0xFF;
        let mask = 0xFFFFFF00;
        if (j & 0x4) {
          expectedOut <<= 8;
          mask = 0xFFFF00FF;
        }
        let expected = {...regs};
        switch (j & 0x3) {
          case 0: expected.eax = expected.eax & mask | expectedOut; break;
          case 1: expected.ecx = expected.ecx & mask | expectedOut; break;
          case 2: expected.edx = expected.edx & mask | expectedOut; break;
          case 3: expected.ebx = expected.ebx & mask | expectedOut; break;
        }
        compareRegs(test, x86, expected, 'sub ' + rn[j] + ', ' + rn[i] + ':');
        setRegs(x86, regs);
      }
    }

    test.done();
  },
});

