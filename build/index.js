"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = require("./memory");
const x86_1 = require("./x86");
let mem = new memory_1.default({
    textLength: 65536,
    stackLength: 65536,
});
let x86Machine = new x86_1.default(mem, {
    eax: 0,
    ecx: 0,
    edx: 0,
    ebx: 0,
    esi: 0,
    edi: 0,
    ebp: 0,
    esp: mem.getStackTopAddr(),
    eip: mem.getTextBaseAddr(),
    eflags: (1 << 1) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 15),
});
function toHex(val) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    return val.toString(16).toUpperCase();
}
function syncRegs() {
    const regs = x86Machine.getRegisters();
    document.getElementById('reg-eax').value = toHex(regs.eax);
    document.getElementById('reg-ecx').value = toHex(regs.ecx);
    document.getElementById('reg-edx').value = toHex(regs.edx);
    document.getElementById('reg-ebx').value = toHex(regs.ebx);
    document.getElementById('reg-esi').value = toHex(regs.esi);
    document.getElementById('reg-edi').value = toHex(regs.edi);
    document.getElementById('reg-ebp').value = toHex(regs.ebp);
    document.getElementById('reg-esp').value = toHex(regs.esp);
    document.getElementById('reg-eip').value = toHex(regs.eip);
    document.getElementById('reg-eflags').value = toHex(regs.eflags);
}
function syncFlags() {
    document.getElementById('reg-cf').checked = x86Machine.getFlag(0);
    document.getElementById('reg-pf').checked = x86Machine.getFlag(2);
    document.getElementById('reg-af').checked = x86Machine.getFlag(4);
    document.getElementById('reg-zf').checked = x86Machine.getFlag(6);
    document.getElementById('reg-sf').checked = x86Machine.getFlag(7);
    document.getElementById('reg-tf').checked = x86Machine.getFlag(8);
    document.getElementById('reg-if').checked = x86Machine.getFlag(9);
    document.getElementById('reg-df').checked = x86Machine.getFlag(10);
    document.getElementById('reg-of').checked = x86Machine.getFlag(11);
}
function run() {
}
function step() {
}
function stop() {
}
window.run = run;
window.step = step;
window.stop = stop;
//# sourceMappingURL=index.js.map