"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./address");
const memory_1 = require("./memory");
const x86_1 = require("./x86");
let mem = null;
let x86Machine = null;
function toHex(val) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    const tmp = '00000000' + val.toString(16).toUpperCase();
    return tmp.substring(tmp.length - 8);
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
    document.getElementById('flg-cf').checked = x86Machine.getFlag(0);
    document.getElementById('flg-pf').checked = x86Machine.getFlag(2);
    document.getElementById('flg-af').checked = x86Machine.getFlag(4);
    document.getElementById('flg-zf').checked = x86Machine.getFlag(6);
    document.getElementById('flg-sf').checked = x86Machine.getFlag(7);
    document.getElementById('flg-tf').checked = x86Machine.getFlag(8);
    document.getElementById('flg-if').checked = x86Machine.getFlag(9);
    document.getElementById('flg-df').checked = x86Machine.getFlag(10);
    document.getElementById('flg-of').checked = x86Machine.getFlag(11);
}
function init(src) {
    mem = new memory_1.default({
        textLength: 65536,
        stackLength: 65536,
    });
    src = src.toUpperCase().replace(/[^\dA-F]/g, '');
    const words = src.match(/.{1,8}/g);
    for (let i = 0; i < words.length; ++i) {
        mem.writeWord(address_1.TEXT_MASK | (i << 2), parseInt(words[i], 16));
    }
    x86Machine = new x86_1.default(mem, {
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
}
function run() {
}
function step() {
    if (x86Machine == null) {
        init(document.getElementById('x86-src').value);
    }
    x86Machine.step();
    syncRegs();
    syncFlags();
}
function stop() {
}
window.run = run;
window.step = step;
window.stop = stop;
//# sourceMappingURL=index.js.map