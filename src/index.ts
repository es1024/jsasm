import {TEXT_MASK} from './address';
import MemoryManager from './memory';
import SIGBASE from './error/sigbase';
import X86, {X86Flag} from './x86';

let mem: MemoryManager = null;
let x86Machine: X86 = null;

function toHex(val: number, minlen: number): string {
  if (val < 0) {
    val = 0xFFFFFFFF + val + 1;
  }
  const tmp = '00000000' + val.toString(16).toUpperCase();
  return tmp.substring(tmp.length - minlen);
}

function syncRegs(): void {
  const regs = x86Machine.getRegisters();
  (<any> document).getElementById('reg-eax').value = toHex(regs.eax, 8);
  (<any> document).getElementById('reg-ecx').value = toHex(regs.ecx, 8);
  (<any> document).getElementById('reg-edx').value = toHex(regs.edx, 8);
  (<any> document).getElementById('reg-ebx').value = toHex(regs.ebx, 8);
  (<any> document).getElementById('reg-esi').value = toHex(regs.esi, 8);
  (<any> document).getElementById('reg-edi').value = toHex(regs.edi, 8);
  (<any> document).getElementById('reg-ebp').value = toHex(regs.ebp, 8);
  (<any> document).getElementById('reg-esp').value = toHex(regs.esp, 8);
  (<any> document).getElementById('reg-eip').value = toHex(regs.eip, 8);
  (<any> document).getElementById('reg-eflags').value = toHex(regs.eflags, 8);
  (<any> document).getElementById('reg-es').value = toHex(regs.es, 4);
  (<any> document).getElementById('reg-cs').value = toHex(regs.cs, 4);
  (<any> document).getElementById('reg-ss').value = toHex(regs.ss, 4);
  (<any> document).getElementById('reg-ds').value = toHex(regs.ds, 4);
  (<any> document).getElementById('reg-fs').value = toHex(regs.fs, 4);
  (<any> document).getElementById('reg-gs').value = toHex(regs.gs, 4);
}

function syncFlags(): void {
  (<any> document).getElementById('flg-cf').checked = x86Machine.getFlag(X86Flag.CF);
  (<any> document).getElementById('flg-pf').checked = x86Machine.getFlag(X86Flag.PF);
  (<any> document).getElementById('flg-af').checked = x86Machine.getFlag(X86Flag.AF);
  (<any> document).getElementById('flg-zf').checked = x86Machine.getFlag(X86Flag.ZF);
  (<any> document).getElementById('flg-sf').checked = x86Machine.getFlag(X86Flag.SF);
  (<any> document).getElementById('flg-tf').checked = x86Machine.getFlag(X86Flag.TF);
  (<any> document).getElementById('flg-if').checked = x86Machine.getFlag(X86Flag.IF);
  (<any> document).getElementById('flg-df').checked = x86Machine.getFlag(X86Flag.DF);
  (<any> document).getElementById('flg-of').checked = x86Machine.getFlag(X86Flag.OF);
}

function init(src: string): void {
  mem = new MemoryManager({
    textLength: 65536,
    stackLength: 65536,
  });

  src = src.toUpperCase().replace(/[^\dA-F]/g, '');
  const words = src.match(/.{1,8}/g);
  for (let i = 0; i < words.length; ++i) {
    const tmp = words[i].match(/.{1,2}/g);
    tmp.reverse();
    mem.writeWord(TEXT_MASK | (i << 2), parseInt(tmp.join(''), 16));
  }

  x86Machine = new X86(mem, {
    eax: 0,
    ecx: 0,
    edx: 0,
    ebx: 0,
    esi: 0,
    edi: 0,
    ebp: 0,
    esp: mem.getStackTopAddr(),
    eip: mem.getTextBaseAddr(),
    // lots of "always 1" flags
    eflags: (1 << 1) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 15),
    es: 0,
    cs: 0,
    ss: 0,
    ds: 0,
    fs: 0,
    gs: 0,
  });
}

function run(): void {
  (<any> document).getElementById('x86-error').innerHTML = 'unimplemented';
}

function step(): void {
  if (x86Machine == null) {
    init((<any> document).getElementById('x86-src').value);
  }
  try {
    x86Machine.step();
  } catch (e) {
    if (e instanceof SIGBASE) {
      (<any> document).getElementById('x86-error').innerHTML =
          (<SIGBASE> e).sigtype() + ': ' + e.message;
      return;
    } else {
      (<any> document).getElementById('x86-error').innerHTML = 'Unknown error';
      throw e;
    }
  }
  syncRegs();
  syncFlags();
}

function stop(): void {
  (<any> document).getElementById('x86-error').innerHTML = 'unimplemented';
}

function reset(): void {
  x86Machine = null;
  init((<any> document).getElementById('x86-src').value);
  syncRegs();
  syncFlags();
  x86Machine = null;
  (<any> document).getElementById('x86-error').innerHTML = '';
}

(<any> window).run = run;
(<any> window).step = step;
(<any> window).stop = stop;
(<any> window).reset = reset;

