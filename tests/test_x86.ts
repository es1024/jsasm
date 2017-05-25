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
  if (typeof regs.esp === 'undefined') { regs.esp = 0; }
  if (typeof regs.ebp === 'undefined') { regs.ebp = 0; }
  if (typeof regs.esi === 'undefined') { regs.esi = 0; }
  if (typeof regs.edi === 'undefined') { regs.edi = mem.getStackTopAddr(); }
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

function sigill(error: any): boolean {
  return typeof error.sigtype === 'function' && error.sigtype() === 'SIGILL';
}

Suite.run({
  'execution order': function(test: any): void {
    let x86: X86;
    let text = Array(256).fill(0xFF);
    let step = () => { x86.step(); };

    x86 = prepareX86(text);
    test.throws(step, SIGILL);

    for (let i = 0; i < 255; ++i) {
      text[i] = 0x90;
      x86 = prepareX86(text);
      let initEIP = x86.getRegisters().eip;
      for (let j = 0; j <= i; ++j) {
        test.doesNotThrow(step);
        test.equal(x86.getRegisters().eip, initEIP + j + 1);
      }
      test.throws(step, SIGILL);
    }

    test.done();
  },
});

