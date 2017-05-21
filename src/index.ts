import MemoryManager from './memory';
import X86, {X86Flag} from './x86';

let mem = new MemoryManager({
  textLength: 65536,
  stackLength: 65536,
});

let x86Machine = new X86(mem, {
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

function toHex(val: number): string {
  if (val < 0) {
    val = 0xFFFFFFFF + val + 1;
  }
  return val.toString(16).toUpperCase();
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
  (<any> document).getElementById('reg-cf').checked = x86Machine.getFlag(X86Flag.CF);
  (<any> document).getElementById('reg-pf').checked = x86Machine.getFlag(X86Flag.PF);
  (<any> document).getElementById('reg-af').checked = x86Machine.getFlag(X86Flag.AF);
  (<any> document).getElementById('reg-zf').checked = x86Machine.getFlag(X86Flag.ZF);
  (<any> document).getElementById('reg-sf').checked = x86Machine.getFlag(X86Flag.SF);
  (<any> document).getElementById('reg-tf').checked = x86Machine.getFlag(X86Flag.TF);
  (<any> document).getElementById('reg-if').checked = x86Machine.getFlag(X86Flag.IF);
  (<any> document).getElementById('reg-df').checked = x86Machine.getFlag(X86Flag.DF);
  (<any> document).getElementById('reg-of').checked = x86Machine.getFlag(X86Flag.OF);
}

function run(): void {

}

function step(): void {

}

function stop(): void {

}

(<any> window).run = run;
(<any> window).step = step;
(<any> window).stop = stop;

