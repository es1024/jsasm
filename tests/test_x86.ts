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

function compareRegs(test: any, x86: X86, regs: X86RegistersOpt): void {
  let aregs = x86.getRegisters();
  if (typeof regs.eax !== 'undefined') { test.equal(aregs.eax | 0, regs.eax | 0); }
  if (typeof regs.ecx !== 'undefined') { test.equal(aregs.ecx | 0, regs.ecx | 0); }
  if (typeof regs.edx !== 'undefined') { test.equal(aregs.edx | 0, regs.edx | 0); }
  if (typeof regs.ebx !== 'undefined') { test.equal(aregs.ebx | 0, regs.ebx | 0); }
  if (typeof regs.esp !== 'undefined') { test.equal(aregs.esp | 0, regs.esp | 0); }
  if (typeof regs.ebp !== 'undefined') { test.equal(aregs.ebp | 0, regs.ebp | 0); }
  if (typeof regs.esi !== 'undefined') { test.equal(aregs.esi | 0, regs.esi | 0); }
  if (typeof regs.edi !== 'undefined') { test.equal(aregs.edi | 0, regs.edi | 0); }
  if (typeof regs.eip !== 'undefined') { test.equal(aregs.eip | 0, regs.eip | 0); }
  if (typeof regs.eflags !== 'undefined') {
    test.equal(aregs.eflags | 0, regs.eflags | 0);
  }
  if (typeof regs.es !== 'undefined') { test.equal(aregs.es | 0, regs.es | 0); }
  if (typeof regs.cs !== 'undefined') { test.equal(aregs.cs | 0, regs.cs | 0); }
  if (typeof regs.ss !== 'undefined') { test.equal(aregs.ss | 0, regs.ss | 0); }
  if (typeof regs.ds !== 'undefined') { test.equal(aregs.ds | 0, regs.ds | 0); }
  if (typeof regs.fs !== 'undefined') { test.equal(aregs.fs | 0, regs.fs | 0); }
  if (typeof regs.gs !== 'undefined') { test.equal(aregs.gs | 0, regs.gs | 0); }
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

        let expectedOut = (1 << j) - (1 << i);
        if (expectedOut < 0) {
          expectedOut = 0x100 - expectedOut;
        }
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
        test.log(expected);
        compareRegs(test, x86, expected);
        x86.setRegisters(regs);
      }
    }

    test.done();
  },
});

