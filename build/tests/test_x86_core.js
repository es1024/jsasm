"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("../src/address");
const sigill_1 = require("../src/error/sigill");
const helpers = require("./helpers");
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
        const assignReg = bits == 8 ? helpers.assignReg8 : helpers.assignReg32;
        const getReg = bits == 8 ? helpers.getReg8 : helpers.getReg32;
        const REG = bits == 8 ? helpers.REG8 : helpers.REG32;
        assignReg(uregs, reg, r1val);
        assignReg(uregs, reg2, r2val);
        r1val = getReg(uregs, reg);
        const text = Array(2);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = 0x3 << 6 | reg << 3 | reg2;
        const x86 = helpers.prepareX86(text, undefined, uregs, 4, 0);
        const mem = x86.getMemoryManager();
        x86.step();
        const tname = 'sub ' + REG[reg2] + ', ' + REG[reg] + ':';
        const expected = Object.assign({}, uregs);
        assignReg(expected, reg2, (getReg(expected, reg2) - getReg(expected, reg))
            & mask);
        helpers.compareRegs(test, x86, expected, tname);
    },
    'mod/reg/rm non-SIB/disp': function (test, mode, reg, ireg, dir, bits, shift, sign) {
        let disp = sign * [0, 0x7A, 0x7436FE][mode];
        let rval = [0xA0, 0x817408][bits == 8 ? 0 : 1];
        const offsbits = [0, 1, 4][mode];
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
        const assignReg = bits == 8 ? helpers.assignReg8 : helpers.assignReg32;
        const getReg = bits == 8 ? helpers.getReg8 : helpers.getReg32;
        const REG = bits == 8 ? helpers.REG8 : helpers.REG32;
        const effAddr = (rval + shift) | address_1.STACK_MASK;
        assignReg(uregs, reg, rval);
        helpers.assignReg32(uregs, ireg, ((rval + shift) | address_1.STACK_MASK) - disp);
        rval = getReg(uregs, reg);
        const text = Array(6);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = mode << 6 | reg << 3 | ireg;
        for (let i = 0; i < offsbits; ++i) {
            text[i + 2] = (disp >>> (i << 3)) & 0xFF;
        }
        const x86 = helpers.prepareX86(text, undefined, uregs, 8);
        const mem = x86.getMemoryManager();
        let dstr = '';
        if (disp) {
            dstr = (disp > 0 ? ' + ' : ' - ') + '0x' + Math.abs(disp).toString(16);
        }
        x86.step();
        const memVal = helpers.hash(effAddr) | helpers.hash(effAddr + 1) << 8
            | helpers.hash(effAddr + 2) << 16 | helpers.hash(effAddr + 3) << 24;
        if (!dir) {
            const tname = 'sub ' + ['byte', 'dword'][bits == 8 ? 0 : 1] + ' ['
                + helpers.REG32[ireg] + dstr + '], ' + REG[reg] + '; shift=' + shift + ':';
            helpers.compareRegs(test, x86, uregs, tname);
            const expected = (memVal - rval) & mask;
            const w1 = mem.readWord(effAddr & ~0x3);
            const w2 = mem.readWord(4 + (effAddr & ~0x3));
            let actual = w1 >>> ((effAddr & 0x3) << 3);
            if ((effAddr & 0x3) != 0) {
                actual |= w2 << ((4 - (effAddr & 0x3)) << 3);
            }
            actual &= mask;
            helpers.annotatedTestEqualHex(test, actual, expected, tname);
        }
        else {
            const tname = 'sub ' + REG[reg] + ', ' + ['byte', 'dword'][bits == 8 ? 0 : 1]
                + ' [' + helpers.REG32[ireg] + dstr + ']; shift=' + shift + ':';
            test.notOk(mem.anyWrites(), tname);
            const expected = Object.assign({}, uregs);
            assignReg(expected, reg, getReg(expected, reg) - (memVal & mask));
            helpers.compareRegs(test, x86, expected, tname);
        }
    },
    'mod/reg/rm [disp]': function (test, reg, dir, bits, offset) {
        const r1val = [0xA0, 0x1A817408][bits == 8 ? 0 : 1];
        const mask = [0xFF, 0xFFFFFFFF][bits == 8 ? 0 : 1];
        const disp = address_1.STACK_MASK | offset;
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
        const assignReg = bits == 8 ? helpers.assignReg8 : helpers.assignReg32;
        const getReg = bits == 8 ? helpers.getReg8 : helpers.getReg32;
        const REG = bits == 8 ? helpers.REG8 : helpers.REG32;
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
        const x86 = helpers.prepareX86(text, stack, uregs, 8, 8);
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
            helpers.compareRegs(test, x86, expected, tname);
            helpers.annotatedTestEqualHex(test, mem.readWord(0 | address_1.STACK_MASK), 0x03020100, tname);
            helpers.annotatedTestEqualHex(test, mem.readWord(4 | address_1.STACK_MASK), 0x07060504, tname);
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
            helpers.annotatedTestEqualHex(test, mem.readWord(0 | address_1.STACK_MASK), wA, tname);
            helpers.annotatedTestEqualHex(test, mem.readWord(4 | address_1.STACK_MASK), wB, tname);
            helpers.compareRegs(test, x86, uregs, tname);
        }
    },
    'mod/reg/rm SIB non-disp': function (test, mode, reg, dir, bits, shift, sign, scale, sreg, breg) {
        let sf = 1 << scale;
        let disp = sign * [0, 0x78, 0x1f087068][mode];
        let rval = [0xA0, 0x817408][bits == 8 ? 0 : 1];
        let sval = 0x2E17410;
        const offsbits = [0, 1, 4][mode];
        const bscale = sreg == breg && sreg != 4 ? sf + 1 : 1;
        let bval = 0x3DEADF8 + shift - Math.floor(disp / bscale)
            + Math.floor(0x40000380 / bscale);
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
        const assignReg = bits == 8 ? helpers.assignReg8 : helpers.assignReg32;
        const getReg = bits == 8 ? helpers.getReg8 : helpers.getReg32;
        const REG = bits == 8 ? helpers.REG8 : helpers.REG32;
        assignReg(uregs, reg, rval);
        helpers.assignReg32(uregs, sreg, sval);
        helpers.assignReg32(uregs, breg, bval);
        rval = getReg(uregs, reg);
        sval = helpers.getReg32(uregs, sreg);
        const text = Array(7);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = mode << 6 | reg << 3 | 0x4;
        text[2] = scale << 6 | sreg << 3 | breg;
        for (let i = 0; i < offsbits; ++i) {
            text[i + 3] = (disp >>> (i << 3)) & 0xFF;
        }
        const x86 = helpers.prepareX86(text, undefined, uregs, 8);
        const mem = x86.getMemoryManager();
        let dsib = ['byte', 'dword'][bits == 8 ? 0 : 1] + ' ptr [' + sf + '*';
        dsib += sreg == 4 ? 'eiz' : helpers.REG32[sreg];
        dsib += ' + ' + helpers.REG32[breg];
        if (disp) {
            dsib += (disp > 0 ? ' + ' : ' - ') + '0x' + Math.abs(disp).toString(16);
        }
        dsib += ']';
        x86.step();
        const effAddr = sf * (sreg == 4 ? 0 : sval) + bval + disp;
        let memVal = 0;
        for (let i = 4; i-- > 0;) {
            memVal <<= 8;
            memVal |= helpers.hash(effAddr + i);
        }
        memVal &= mask;
        if (!dir) {
            const tname = 'sub ' + dsib + ', ' + REG[reg] + '; shift=' + shift + ':';
            helpers.compareRegs(test, x86, uregs, tname);
            const w1 = mem.readWord(effAddr & ~0x3);
            const w2 = mem.readWord(4 + (effAddr & ~0x3));
            let actual = 0;
            for (let i = 4; i-- > 0;) {
                actual <<= 8;
                let shift = ((effAddr + i) & 3) << 3;
                let isw1 = ((effAddr + i) & 4) == (effAddr & 4);
                actual |= ((isw1 ? w1 : w2) & (0xFF << shift)) >>> shift;
            }
            actual &= mask;
            const expected = (memVal - getReg(uregs, reg)) & mask;
            helpers.annotatedTestEqualHex(test, actual, expected, tname);
        }
        else {
            const tname = 'sub ' + REG[reg] + ', ' + dsib + '; shift=' + shift + ':';
            test.notOk(mem.anyWrites(), tname);
            const expected = Object.assign({}, uregs);
            assignReg(expected, reg, getReg(expected, reg) - (memVal & mask));
            helpers.compareRegs(test, x86, expected, tname);
        }
    },
    'mod/reg/rm SIB disp': function (test, reg, dir, bits, scale, sreg, offset) {
        const sf = 1 << scale;
        let rval = [0xA0, 0x817408][bits == 8 ? 0 : 1];
        const sval = 0x2E17410;
        const effAddr = address_1.STACK_MASK | offset;
        const disp = (effAddr - sf * (sreg == 4 ? 0 : sval)) & 0xFFFFFFFF;
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
        const assignReg = bits == 8 ? helpers.assignReg8 : helpers.assignReg32;
        const getReg = bits == 8 ? helpers.getReg8 : helpers.getReg32;
        const REG = bits == 8 ? helpers.REG8 : helpers.REG32;
        assignReg(uregs, reg, rval);
        helpers.assignReg32(uregs, sreg, sval);
        rval = getReg(uregs, reg);
        const text = Array(7);
        text[0] = 0x28 + (dir ? 2 : 0) + (bits == 8 ? 0 : 1);
        text[1] = reg << 3 | 0x4;
        text[2] = scale << 6 | sreg << 3 | 0x5;
        for (let i = 0; i < 4; ++i) {
            text[i + 3] = (disp >>> (i << 3)) & 0xFF;
        }
        const x86 = helpers.prepareX86(text, undefined, uregs, 8);
        const mem = x86.getMemoryManager();
        let dsib = ['byte', 'dword'][bits == 8 ? 0 : 1] + ' ptr [' + sf + ']';
        dsib += sreg == 4 ? 'eiz' : helpers.REG32[sreg];
        if (disp) {
            dsib += (disp > 0 ? ' + ' : ' - ') + '0x' + Math.abs(disp).toString(16);
        }
        dsib += ']';
        x86.step();
        let memVal = 0;
        for (let i = 4; i-- > 0;) {
            memVal <<= 8;
            memVal |= helpers.hash(effAddr + i);
        }
        memVal &= mask;
        if (!dir) {
            const tname = 'sub ' + dsib + ', ' + REG[reg] + '; offset=' + offset + ':';
            helpers.compareRegs(test, x86, uregs, tname);
            const w1 = mem.readWord(effAddr & ~0x3);
            const w2 = mem.readWord(4 + (effAddr & ~0x3));
            let actual = 0;
            for (let i = 4; i-- > 0;) {
                actual <<= 8;
                let shift = ((effAddr + i) & 3) << 3;
                let isw1 = ((effAddr + i) & 4) == (effAddr & 4);
                actual |= ((isw1 ? w1 : w2) & (0xFF << shift)) >>> shift;
            }
            actual &= mask;
            const expected = (memVal - getReg(uregs, reg)) & mask;
            helpers.annotatedTestEqualHex(test, actual, expected, tname);
        }
        else {
            const tname = 'sub ' + REG[reg] + ', ' + dsib + '; offset=' + offset + ':';
            test.notOk(mem.anyWrites(), tname);
            const expected = Object.assign({}, uregs);
            assignReg(expected, reg, getReg(expected, reg) - (memVal & mask));
            helpers.compareRegs(test, x86, expected, tname);
        }
    },
};
const tests = {
    'single byte instruction extraction': function (test) {
        let x86;
        let text = Array(64).fill(0xFF);
        let step = () => { x86.step(); };
        x86 = helpers.prepareX86(text);
        let initEIP = x86.getRegisters().eip;
        test.throws(step, sigill_1.default);
        for (let i = 0; i < 63; ++i) {
            text[i] = 0x90;
            if (i > 0) {
                test[i - 1] = 0xFF;
            }
            x86 = helpers.prepareX86(text, undefined, { eip: initEIP });
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
    'mod/reg/rm SIB non-disp': function (test) {
        const bitv = [32, 8];
        for (let bits = bitv.length; bits--;) {
            for (let mode = 0; mode < 3; ++mode) {
                for (let reg = 0; reg < 8; ++reg) {
                    for (let sreg = 0; sreg < 8; ++sreg) {
                        for (let breg = 0; breg < 8; ++breg) {
                            if (breg == 5 && mode == 0) {
                                continue;
                            }
                            for (let scale = 0; scale < 4; ++scale) {
                                for (let shift = 0; shift < 4; ++shift) {
                                    testHelpers['mod/reg/rm SIB non-disp'](test, mode, reg, false, bitv[bits], shift, -1, scale, sreg, breg);
                                    testHelpers['mod/reg/rm SIB non-disp'](test, mode, reg, true, bitv[bits], shift, -1, scale, sreg, breg);
                                    if (mode == 0) {
                                        continue;
                                    }
                                    testHelpers['mod/reg/rm SIB non-disp'](test, mode, reg, false, bitv[bits], shift, +1, scale, sreg, breg);
                                    testHelpers['mod/reg/rm SIB non-disp'](test, mode, reg, true, bitv[bits], shift, +1, scale, sreg, breg);
                                }
                            }
                        }
                    }
                }
            }
        }
        test.done();
    },
    'mod/reg/rm SIB disp': function (test) {
        const bitv = [32, 8];
        for (let bits = bitv.length; bits--;) {
            for (let reg = 0; reg < 8; ++reg) {
                for (let scale = 0; scale < 4; ++scale) {
                    for (let sreg = 0; sreg < 8; ++sreg) {
                        for (let offset = 0; offset < 4; ++offset) {
                            testHelpers['mod/reg/rm SIB disp'](test, reg, false, bitv[bits], scale, sreg, offset);
                            testHelpers['mod/reg/rm SIB disp'](test, reg, true, bitv[bits], scale, sreg, offset);
                        }
                    }
                }
            }
        }
        test.done();
    },
};
exports.default = tests;
//# sourceMappingURL=test_x86_core.js.map