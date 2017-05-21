import {TEXT_MASK} from './address';
import MemoryManager from './memory';
import X86, {X86Flag} from './x86';

let mem: MemoryManager = null;
let x86Machine: X86 = null;

function toHex(val: number): string {
  if (val < 0) {
    val = 0xFFFFFFFF + val + 1;
  }
  const tmp = '00000000' + val.toString(16).toUpperCase();
  return tmp.substring(tmp.length - 8);
}

function syncRegs(): void {
  const regs = x86Machine.getRegisters();
  (<any> document).getElementById('reg-eax').value = toHex(regs.eax);
  (<any> document).getElementById('reg-ecx').value = toHex(regs.ecx);
  (<any> document).getElementById('reg-edx').value = toHex(regs.edx);
  (<any> document).getElementById('reg-ebx').value = toHex(regs.ebx);
  (<any> document).getElementById('reg-esi').value = toHex(regs.esi);
  (<any> document).getElementById('reg-edi').value = toHex(regs.edi);
  (<any> document).getElementById('reg-ebp').value = toHex(regs.ebp);
  (<any> document).getElementById('reg-esp').value = toHex(regs.esp);
  (<any> document).getElementById('reg-eip').value = toHex(regs.eip);
  (<any> document).getElementById('reg-eflags').value = toHex(regs.eflags);
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
    mem.writeWord(TEXT_MASK | (i << 2), parseInt(words[i], 16));
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
  });
}

function run(): void {

}

function step(): void {
  if (x86Machine == null) {
    init((<any> document).getElementById('x86-src').value);
  }
  x86Machine.step();
  syncRegs();
  syncFlags();
}

function stop(): void {

}

(<any> window).run = run;
(<any> window).step = step;
(<any> window).stop = stop;

