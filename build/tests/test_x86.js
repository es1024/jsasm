"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Suite = require("testjs");
const address_1 = require("../src/address");
const memory_1 = require("../src/memory");
const sigill_1 = require("../src/error/sigill");
const x86_1 = require("../src/x86");
function prepareX86(text, stack, regs) {
    const mem = new memory_1.default({
        textLength: 256,
        stackLength: 256,
    });
    if (typeof regs === 'undefined') {
        regs = {};
    }
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
        regs.esp = 0;
    }
    if (typeof regs.ebp === 'undefined') {
        regs.ebp = 0;
    }
    if (typeof regs.esi === 'undefined') {
        regs.esi = 0;
    }
    if (typeof regs.edi === 'undefined') {
        regs.edi = mem.getStackTopAddr();
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
        mem.writeWord(address_1.TEXT_MASK | i, value);
    }
    if (stack) {
        for (let i = 0; i < stack.length; i += 4) {
            let value = 0;
            for (let j = 0; j < 4 && i + j < stack.length; ++j) {
                value |= stack[i + j] << (j << 3);
            }
            mem.writeWord(address_1.STACK_MASK | i, value);
        }
    }
    return new x86_1.default(mem, regs);
}
function sigill(error) {
    return typeof error.sigtype === 'function' && error.sigtype() === 'SIGILL';
}
Suite.run({
    'execution order': function (test) {
        let x86;
        let text = Array(256).fill(0xFF);
        let step = () => { x86.step(); };
        x86 = prepareX86(text);
        test.throws(step, sigill_1.default);
        for (let i = 0; i < 255; ++i) {
            text[i] = 0x90;
            x86 = prepareX86(text);
            let initEIP = x86.getRegisters().eip;
            for (let j = 0; j <= i; ++j) {
                test.doesNotThrow(step);
                test.equal(x86.getRegisters().eip, initEIP + j + 1);
            }
            test.throws(step, sigill_1.default);
        }
        test.done();
    },
});
//# sourceMappingURL=test_x86.js.map