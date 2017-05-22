"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./address");
const memory_1 = require("./memory");
const x86_1 = require("./x86");
let mem = null;
let x86Machine = null;
function toHex(val, minlen) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    const tmp = '00000000' + val.toString(16).toUpperCase();
    return tmp.substring(tmp.length - minlen);
}
function syncRegs() {
    const regs = x86Machine.getRegisters();
    document.getElementById('reg-eax').value = toHex(regs.eax, 8);
    document.getElementById('reg-ecx').value = toHex(regs.ecx, 8);
    document.getElementById('reg-edx').value = toHex(regs.edx, 8);
    document.getElementById('reg-ebx').value = toHex(regs.ebx, 8);
    document.getElementById('reg-esi').value = toHex(regs.esi, 8);
    document.getElementById('reg-edi').value = toHex(regs.edi, 8);
    document.getElementById('reg-ebp').value = toHex(regs.ebp, 8);
    document.getElementById('reg-esp').value = toHex(regs.esp, 8);
    document.getElementById('reg-eip').value = toHex(regs.eip, 8);
    document.getElementById('reg-eflags').value = toHex(regs.eflags, 8);
    document.getElementById('reg-es').value = toHex(regs.es, 4);
    document.getElementById('reg-cs').value = toHex(regs.cs, 4);
    document.getElementById('reg-ss').value = toHex(regs.ss, 4);
    document.getElementById('reg-ds').value = toHex(regs.ds, 4);
    document.getElementById('reg-fs').value = toHex(regs.fs, 4);
    document.getElementById('reg-gs').value = toHex(regs.gs, 4);
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
        const tmp = words[i].match(/.{1,2}/g);
        tmp.reverse();
        mem.writeWord(address_1.TEXT_MASK | (i << 2), parseInt(tmp.join(''), 16));
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
        es: 0,
        cs: 0,
        ss: 0,
        ds: 0,
        fs: 0,
        gs: 0,
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