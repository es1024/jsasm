"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Suite = require("testjs");
const address_1 = require("../src/address");
const address_2 = require("../src/address");
const memory_1 = require("../src/memory");
const sigill_1 = require("../src/error/sigill");
const x86_1 = require("../src/x86");
const REG8 = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
const REG16 = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'];
const REG32 = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi'];
class CircularStackMemoryManager extends memory_1.default {
    readWord(addr) {
        if (address_1.isStackAddress(addr)) {
            addr = address_2.STACK_MASK | (address_1.getAddressOffset(addr) % (this.stack.length << 2));
        }
        return super.readWord(addr);
    }
    writeWord(addr, value) {
        if (address_1.isStackAddress(addr)) {
            addr = address_2.STACK_MASK | (address_1.getAddressOffset(addr) % (this.stack.length << 2));
        }
        super.writeWord(addr, value);
    }
}
function prepareX86(text, stack, regs, textLength, stackLength) {
    const mem = new CircularStackMemoryManager({
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
function annotatedTestEqualHex(test, a, b, pfx) {
    a = ((a | 0) + 4294967296) % 4294967296;
    b = ((b | 0) + 4294967296) % 4294967296;
    test.equal(a, b, pfx + ' expected=' + b.toString(16) + ' actual='
        + a.toString(16));
}
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
const testHelpers = {
    'mod/reg/rm regs': function (test, reg, reg2, dir, bits) {
        if (dir) {
            testHelpers['mod/reg/rm regs'](test, reg2, reg, false, bits);
            return;
        }
        let r1val = [0xA0, 0x8A817408][bits == 8 ? 0 : 1];
        const r2val = [0x35, 0x8BCF8E32][bits == 8 ? 0 : 1];
        const mask = [0xFF, 0xFFFFFFFF][bits == 8 ? 0 : 1];
        const uregs = {
            eax: 0,
            ecx: 0,
            edx: 0,
            ebx: 0,
            esp: 0,
            ebp: 0,
            esi: 0,
            edi: 0,
        };
        const assignReg = bits == 8 ? assignReg8 : assignReg32;
        const getReg = bits == 8 ? getReg8 : getReg32;
        const REG = bits == 8 ? REG8 : REG32;
        assignReg(uregs, reg, r1val);
        assignReg(uregs, reg2, r2val);
        r1val = getReg(uregs, reg);
        const text = Array(2);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = 0x3 << 6 | reg << 3 | reg2;
        const x86 = prepareX86(text, undefined, uregs, 4, 0);
        const mem = x86.getMemoryManager();
        x86.step();
        const tname = 'sub ' + REG[reg2] + ', ' + REG[reg] + ':';
        const expected = Object.assign({}, uregs);
        assignReg(expected, reg2, (getReg(expected, reg2) - getReg(expected, reg))
            & mask);
        compareRegs(test, x86, expected, tname);
    },
    'mod/reg/rm non-SIB/disp': function (test, mode, reg, ireg, dir, bits, shift, sign) {
        let disp = sign * [0, 0x7A, 0x7436FE][mode];
        let rval = [0xA0, 0x817408][bits == 8 ? 0 : 1];
        const mask = [0xFF, 0xFFFFFFFF][bits == 8 ? 0 : 1];
        const uregs = {
            eax: 0,
            ecx: 0,
            edx: 0,
            ebx: 0,
            esp: 0,
            ebp: 0,
            esi: 0,
            edi: 0,
        };
        const assignReg = bits == 8 ? assignReg8 : assignReg32;
        const getReg = bits == 8 ? getReg8 : getReg32;
        const REG = bits == 8 ? REG8 : REG32;
        assignReg(uregs, reg, rval);
        assignReg32(uregs, ireg, (rval + shift - disp) | address_2.STACK_MASK);
        rval = getReg(uregs, reg);
        const text = Array(6);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = mode << 6 | reg << 3 | ireg;
        for (let i = 0; i < (bits >>> 3); ++i) {
            text[i + 2] = (disp >>> (i << 3)) & 0xFF;
        }
        const stack = Array(8);
        for (let i = 0; i < 8; ++i) {
            stack[i] = i;
        }
        const x86 = prepareX86(text, stack, uregs, 8, 8);
        const mem = x86.getMemoryManager();
        let dstr = '';
        if (disp) {
            dstr = (disp > 0 ? ' + ' : ' - ') + '0x' + Math.abs(disp).toString(16);
        }
        x86.step();
        if (!dir) {
            const tname = 'sub ' + ['byte', 'dword'][bits == 8 ? 0 : 1] + ' ['
                + REG32[ireg] + dstr + '], ' + REG[reg] + '; shift=' + shift + ':';
            compareRegs(test, x86, uregs, tname);
            const expected = ((shift | (shift + 1) << 8 | (shift + 2) << 16
                | (shift + 3) << 24) - rval) & mask;
            const w1 = mem.readWord(0 | address_2.STACK_MASK);
            const w2 = mem.readWord(4 | address_2.STACK_MASK);
            let actual = w1 >>> (shift << 3);
            if (shift) {
                actual |= w2 << ((4 - shift) << 3);
            }
            actual &= mask;
            annotatedTestEqualHex(test, actual, expected, tname);
        }
        else {
            const tname = 'sub ' + REG[reg] + ', ' + ['byte', 'dword'][bits == 8 ? 0 : 1]
                + ' [' + REG32[ireg] + dstr + ']; shift=' + shift + ':';
            annotatedTestEqualHex(test, mem.readWord(0 | address_2.STACK_MASK), 0x03020100, tname);
            annotatedTestEqualHex(test, mem.readWord(4 | address_2.STACK_MASK), 0x07060504, tname);
            let memValue = 0;
            for (let i = 0; i < 4; ++i) {
                memValue |= (i + shift) << (i << 3);
            }
            const expected = Object.assign({}, uregs);
            assignReg(expected, reg, getReg(expected, reg) - (memValue & mask));
            compareRegs(test, x86, expected, tname);
        }
    },
    'mod/reg/rm [disp]': function (test, reg, dir, bits, offset) {
        const r1val = [0xA0, 0x1A817408][bits == 8 ? 0 : 1];
        const mask = [0xFF, 0xFFFFFFFF][bits == 8 ? 0 : 1];
        const disp = address_2.STACK_MASK | offset;
        const uregs = {
            eax: 0,
            ecx: 0,
            edx: 0,
            ebx: 0,
            esp: 0,
            ebp: 0,
            esi: 0,
            edi: 0,
        };
        const assignReg = bits == 8 ? assignReg8 : assignReg32;
        const getReg = bits == 8 ? getReg8 : getReg32;
        const REG = bits == 8 ? REG8 : REG32;
        assignReg(uregs, reg, r1val);
        const text = Array(2);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = reg << 3 | 0x05;
        text[2] = disp & 0xFF;
        text[3] = (disp >>> 8) & 0xFF;
        text[4] = (disp >>> 16) & 0xFF;
        text[5] = (disp >>> 24) & 0xFF;
        const stack = Array(8);
        for (let i = stack.length; i--;) {
            stack[i] = i;
        }
        const x86 = prepareX86(text, stack, uregs, 8, 8);
        const mem = x86.getMemoryManager();
        x86.step();
        let memoryVal = 0;
        for (let i = 0; i < 4; ++i) {
            memoryVal |= (i + offset) << (i << 3);
        }
        if (dir) {
            const tname = 'sub ' + REG[reg] + ', [0x' + disp.toString(16) + ']:';
            const expected = Object.assign({}, uregs);
            assignReg(expected, reg, (r1val - (memoryVal & mask)) & mask);
            compareRegs(test, x86, expected, tname);
            annotatedTestEqualHex(test, mem.readWord(0 | address_2.STACK_MASK), 0x03020100, tname);
            annotatedTestEqualHex(test, mem.readWord(4 | address_2.STACK_MASK), 0x07060504, tname);
        }
        else {
            const tname = 'sub [0x' + disp.toString(16) + '], ' + REG[reg] + ':';
            let wA = 0x03020100, wB = 0x07060504;
            const v = ((memoryVal & mask) - r1val) & mask;
            if (bits == 8) {
                wA &= ~(0xFF << (offset << 3));
                wA |= v << (offset << 3);
            }
            else if (offset) {
                const lmask = (1 << (offset << 3)) - 1;
                wA &= lmask;
                wA |= v << (offset << 3);
                wB &= ~lmask;
                wB |= v >>> ((4 - offset) << 3);
            }
            else {
                wA = v;
            }
            annotatedTestEqualHex(test, mem.readWord(0 | address_2.STACK_MASK), wA, tname);
            annotatedTestEqualHex(test, mem.readWord(4 | address_2.STACK_MASK), wB, tname);
            compareRegs(test, x86, uregs, tname);
        }
    },
};
Suite.run({
    'single byte instruction extraction': function (test) {
        let x86;
        let text = Array(64).fill(0xFF);
        let step = () => { x86.step(); };
        x86 = prepareX86(text);
        let initEIP = x86.getRegisters().eip;
        test.throws(step, sigill_1.default);
        for (let i = 0; i < 63; ++i) {
            text[i] = 0x90;
            if (i > 0) {
                test[i - 1] = 0xFF;
            }
            x86 = prepareX86(text, undefined, { eip: initEIP });
            test.doesNotThrow(step);
            test.equal(x86.getRegisters().eip, ++initEIP);
            test.throws(step, sigill_1.default);
        }
        test.done();
    },
    'mod/reg/rm reg': function (test) {
        const bitv = [32, 8];
        for (let bits = bitv.length; bits--;) {
            for (let reg = 0; reg < 8; ++reg) {
                for (let reg2 = 0; reg2 < 8; ++reg2) {
                    testHelpers['mod/reg/rm regs'](test, reg, reg2, false, bitv[bits]);
                    testHelpers['mod/reg/rm regs'](test, reg, reg2, true, bitv[bits]);
                }
            }
        }
        test.done();
    },
    'mod/reg/rm offset non-SIB/disp': function (test) {
        const bitv = [32, 8];
        for (let bits = bitv.length; bits--;) {
            for (let mode = 0; mode < 3; ++mode) {
                for (let reg = 0; reg < 8; ++reg) {
                    for (let ireg = 0; ireg < 8; ++ireg) {
                        if (ireg == 4)
                            continue;
                        if (ireg == 5 && mode == 0)
                            continue;
                        for (let shift = 0; shift < 4; ++shift) {
                            testHelpers['mod/reg/rm non-SIB/disp'](test, mode, reg, ireg, false, bitv[bits], shift, +1);
                            testHelpers['mod/reg/rm non-SIB/disp'](test, mode, reg, ireg, false, bitv[bits], shift, -1);
                            testHelpers['mod/reg/rm non-SIB/disp'](test, mode, reg, ireg, true, bitv[bits], shift, +1);
                            testHelpers['mod/reg/rm non-SIB/disp'](test, mode, reg, ireg, true, bitv[bits], shift, -1);
                        }
                    }
                }
            }
        }
        test.done();
    },
    'mod/reg/rm [disp]': function (test) {
        const bitv = [32, 8];
        for (let bits = bitv.length; bits--;) {
            for (let reg = 0; reg < 8; ++reg) {
                for (let offset = 0; offset < 4; ++offset) {
                    testHelpers['mod/reg/rm [disp]'](test, reg, false, bitv[bits], offset);
                    testHelpers['mod/reg/rm [disp]'](test, reg, true, bitv[bits], offset);
                }
            }
        }
        test.done();
    },
});
//# sourceMappingURL=test_x86.js.map