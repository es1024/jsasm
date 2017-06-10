"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("../src/address");
const address_2 = require("../src/address");
const memory_1 = require("../src/memory");
const x86_1 = require("../src/x86");
exports.REG8 = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
exports.REG16 = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'];
exports.REG32 = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi'];
function hash(addr) {
    addr = (addr ^ 61) ^ (addr >> 16);
    addr = (addr + (addr << 3)) & 0xFFFFFFFF;
    addr = addr ^ (addr >> 4);
    addr = (addr * 0x27d4eb2d) & 0xFFFFFFFF;
    addr = addr ^ (addr >> 15);
    return (addr >> 11) & 0xFF;
}
exports.hash = hash;
class CircularStackMemoryManager extends memory_1.default {
    constructor() {
        super(...arguments);
        this.written = {};
    }
    readWord(addr) {
        if (address_1.isStackAddress(addr)) {
            let rv;
            if (typeof this.written[addr] !== 'undefined') {
                rv = this.written[addr];
            }
            else {
                rv = hash(addr) | hash(addr + 1) << 8 | hash(addr + 2) << 16 |
                    hash(addr + 3) << 24;
            }
            return rv;
        }
        return super.readWord(addr);
    }
    writeWord(addr, value) {
        if (address_1.isStackAddress(addr)) {
            this.written[addr] = value;
            return;
        }
        super.writeWord(addr, value);
    }
    anyWrites() {
        return Object.keys(this.written).length != 0;
    }
}
exports.CircularStackMemoryManager = CircularStackMemoryManager;
function prepareX86(text, stack, regs, textLength, stackLength) {
    const mem = new (stackLength ? memory_1.default : CircularStackMemoryManager)({
        textLength: textLength || 256,
        stackLength: stackLength || 256,
    });
    if (typeof regs === 'undefined') {
        regs = {};
    }
    regs = Object.assign({}, regs);
    if (typeof regs.eax === 'undefined') {
        regs.eax = 0;
    }
    if (typeof regs.ecx === 'undefined') {
        regs.ecx = 0;
    }
    if (typeof regs.edx === 'undefined') {
        regs.edx = 0;
    }
    if (typeof regs.ebx === 'undefined') {
        regs.ebx = 0;
    }
    if (typeof regs.esp === 'undefined') {
        regs.esp = mem.getStackTopAddr();
    }
    if (typeof regs.ebp === 'undefined') {
        regs.ebp = 0;
    }
    if (typeof regs.esi === 'undefined') {
        regs.esi = 0;
    }
    if (typeof regs.edi === 'undefined') {
        regs.edi = 0;
    }
    if (typeof regs.eip === 'undefined') {
        regs.eip = mem.getTextBaseAddr();
    }
    if (typeof regs.eflags === 'undefined') {
        regs.eflags = (1 << 1) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 15);
    }
    if (typeof regs.es === 'undefined') {
        regs.es = 0;
    }
    if (typeof regs.cs === 'undefined') {
        regs.cs = 0;
    }
    if (typeof regs.ss === 'undefined') {
        regs.ss = 0;
    }
    if (typeof regs.ds === 'undefined') {
        regs.ds = 0;
    }
    if (typeof regs.fs === 'undefined') {
        regs.fs = 0;
    }
    if (typeof regs.gs === 'undefined') {
        regs.gs = 0;
    }
    for (let i = 0; i < text.length; i += 4) {
        let value = 0;
        for (let j = 0; j < 4 && i + j < text.length; ++j) {
            value |= text[i + j] << (j << 3);
        }
        mem.writeWord(address_2.TEXT_MASK | i, value);
    }
    if (stack) {
        for (let i = 0; i < stack.length; i += 4) {
            let value = 0;
            for (let j = 0; j < 4 && i + j < stack.length; ++j) {
                value |= stack[i + j] << (j << 3);
            }
            mem.writeWord(address_2.STACK_MASK | i, value);
        }
    }
    return new x86_1.default(mem, regs);
}
exports.prepareX86 = prepareX86;
function annotatedTestEqualHex(test, a, b, pfx) {
    a = ((a | 0) + 4294967296) % 4294967296;
    b = ((b | 0) + 4294967296) % 4294967296;
    test.equal(a, b, pfx + ' expected=' + b.toString(16) + ' actual='
        + a.toString(16));
}
exports.annotatedTestEqualHex = annotatedTestEqualHex;
function getReg8(regs, reg) {
    switch (reg) {
        case 0: return regs.eax & 0xFF;
        case 1: return regs.ecx & 0xFF;
        case 2: return regs.edx & 0xFF;
        case 3: return regs.ebx & 0xFF;
        case 4: return (regs.eax >>> 8) & 0xFF;
        case 5: return (regs.ecx >>> 8) & 0xFF;
        case 6: return (regs.edx >>> 8) & 0xFF;
        case 7: return (regs.ebx >>> 8) & 0xFF;
        default: throw new Error('bad register #: ' + reg);
    }
}
exports.getReg8 = getReg8;
function getReg32(regs, reg) {
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
exports.getReg32 = getReg32;
function compareRegs(test, x86, regs, e) {
    let aregs = x86.getRegisters();
    let cmp = (a, b, name) => {
        annotatedTestEqualHex(test, a, b, (e || '') + ' reg=' + name);
    };
    if (typeof regs.eax !== 'undefined') {
        cmp(aregs.eax, regs.eax, 'eax');
    }
    if (typeof regs.ecx !== 'undefined') {
        cmp(aregs.ecx, regs.ecx, 'ecx');
    }
    if (typeof regs.edx !== 'undefined') {
        cmp(aregs.edx, regs.edx, 'edx');
    }
    if (typeof regs.ebx !== 'undefined') {
        cmp(aregs.ebx, regs.ebx, 'ebx');
    }
    if (typeof regs.esp !== 'undefined') {
        cmp(aregs.esp, regs.esp, 'esp');
    }
    if (typeof regs.ebp !== 'undefined') {
        cmp(aregs.ebp, regs.ebp, 'ebp');
    }
    if (typeof regs.esi !== 'undefined') {
        cmp(aregs.esi, regs.esi, 'esi');
    }
    if (typeof regs.edi !== 'undefined') {
        cmp(aregs.edi, regs.edi, 'edi');
    }
    if (typeof regs.eip !== 'undefined') {
        cmp(aregs.eip, regs.eip, 'eip');
    }
    if (typeof regs.eflags !== 'undefined') {
        cmp(aregs.eflags, regs.eflags, 'eflags');
    }
    if (typeof regs.es !== 'undefined') {
        cmp(aregs.es, regs.es, 'es');
    }
    if (typeof regs.cs !== 'undefined') {
        cmp(aregs.cs, regs.cs, 'cs');
    }
    if (typeof regs.ss !== 'undefined') {
        cmp(aregs.ss, regs.ss, 'ss');
    }
    if (typeof regs.ds !== 'undefined') {
        cmp(aregs.ds, regs.ds, 'ds');
    }
    if (typeof regs.fs !== 'undefined') {
        cmp(aregs.fs, regs.fs, 'fs');
    }
    if (typeof regs.gs !== 'undefined') {
        cmp(aregs.gs, regs.gs, 'gs');
    }
}
exports.compareRegs = compareRegs;
function setRegs(x86, regs) {
    let cregs = x86.getRegisters();
    if (typeof regs.eax !== 'undefined') {
        cregs.eax = regs.eax;
    }
    if (typeof regs.ecx !== 'undefined') {
        cregs.ecx = regs.ecx;
    }
    if (typeof regs.edx !== 'undefined') {
        cregs.edx = regs.edx;
    }
    if (typeof regs.ebx !== 'undefined') {
        cregs.ebx = regs.ebx;
    }
    if (typeof regs.esp !== 'undefined') {
        cregs.esp = regs.esp;
    }
    if (typeof regs.ebp !== 'undefined') {
        cregs.ebp = regs.ebp;
    }
    if (typeof regs.esi !== 'undefined') {
        cregs.esi = regs.esi;
    }
    if (typeof regs.edi !== 'undefined') {
        cregs.edi = regs.edi;
    }
    if (typeof regs.eip !== 'undefined') {
        cregs.eip = regs.eip;
    }
    if (typeof regs.eflags !== 'undefined') {
        cregs.eflags = regs.eflags;
    }
    if (typeof regs.es !== 'undefined') {
        cregs.es = regs.es;
    }
    if (typeof regs.cs !== 'undefined') {
        cregs.cs = regs.cs;
    }
    if (typeof regs.ss !== 'undefined') {
        cregs.ss = regs.ss;
    }
    if (typeof regs.ds !== 'undefined') {
        cregs.ds = regs.ds;
    }
    if (typeof regs.fs !== 'undefined') {
        cregs.fs = regs.fs;
    }
    if (typeof regs.gs !== 'undefined') {
        cregs.gs = regs.gs;
    }
    x86.setRegisters(cregs);
}
exports.setRegs = setRegs;
function assignReg8(regs, reg, val) {
    let mask = 0xFFFFFF00;
    val &= 0xFF;
    if (reg & 0x4) {
        val <<= 8;
        mask = 0xFFFF00FF;
    }
    switch (reg & 0x3) {
        case 0:
            regs.eax = (regs.eax || 0) & mask | val;
            break;
        case 1:
            regs.ecx = (regs.ecx || 0) & mask | val;
            break;
        case 2:
            regs.edx = (regs.edx || 0) & mask | val;
            break;
        case 3:
            regs.ebx = (regs.ebx || 0) & mask | val;
            break;
    }
}
exports.assignReg8 = assignReg8;
function assignReg32(regs, reg, val) {
    val &= 0xFFFFFFFF;
    switch (reg) {
        case 0:
            regs.eax = val;
            break;
        case 1:
            regs.ecx = val;
            break;
        case 2:
            regs.edx = val;
            break;
        case 3:
            regs.ebx = val;
            break;
        case 4:
            regs.esp = val;
            break;
        case 5:
            regs.ebp = val;
            break;
        case 6:
            regs.esi = val;
            break;
        case 7:
            regs.edi = val;
            break;
    }
}
exports.assignReg32 = assignReg32;
//# sourceMappingURL=helpers.js.map