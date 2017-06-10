"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const ti = helpers_1.testInst;
const tests = {
    'inst 00 - add r/m8, r8': function (test) {
        const txt = [0x00, 0xC1];
        ti(test, txt, { eax: 0x66, ecx: 0x55 }, { ecx: 0xBB }, '', 'pso');
        ti(test, txt, { eax: 0x30, ecx: 0xFF }, { ecx: 0x2F }, '', 'c');
        ti(test, txt, { eax: 0x82, ecx: 0x81 }, { ecx: 0x03 }, '', 'cpo');
        ti(test, txt, { eax: 0xD0, ecx: 0x30 }, { ecx: 0x00 }, '', 'cpz');
        ti(test, txt, { eax: 0x38, ecx: 0x38 }, { ecx: 0x70 }, '', 'a');
        test.done();
    },
    'inst 01 - add r/m32, r32': function (test) {
        const txt = [0x01, 0xC1];
        ti(test, txt, { eax: 0x20000066, ecx: 0x60000055 }, { ecx: 0x800000BB }, '', 'pso');
        ti(test, txt, { eax: 0x30000000, ecx: 0xFFFFFFFE }, { ecx: 0x2FFFFFFE }, '', 'c');
        ti(test, txt, { eax: 0x80000002, ecx: 0x80000001 }, { ecx: 0x00000003 }, '', 'cpo');
        ti(test, txt, { eax: 0xD0000000, ecx: 0x30000000 }, { ecx: 0x00000000 }, '', 'cpz');
        ti(test, txt, { eax: 0xC1235138, ecx: 0xAE324F38 }, { ecx: 0x6F55A070 }, '', 'cao');
        test.done();
    },
    'inst 02 - add r/8, rm8': function (test) {
        const txt = [0x02, 0xC1];
        ti(test, txt, { eax: 0x55, ecx: 0x66 }, { eax: 0xBB }, '', 'pso');
        ti(test, txt, { eax: 0xFF, ecx: 0x30 }, { eax: 0x2F }, '', 'c');
        ti(test, txt, { eax: 0x81, ecx: 0x82 }, { eax: 0x03 }, '', 'cpo');
        ti(test, txt, { eax: 0x30, ecx: 0xD0 }, { eax: 0x00 }, '', 'cpz');
        ti(test, txt, { eax: 0x38, ecx: 0x38 }, { eax: 0x70 }, '', 'a');
        test.done();
    },
    'inst 03 - add r32, r/m32': function (test) {
        const txt = [0x03, 0xC1];
        ti(test, txt, { eax: 0x60000055, ecx: 0x20000066 }, { eax: 0x800000BB }, '', 'pso');
        ti(test, txt, { eax: 0xFFFFFFFE, ecx: 0x30000000 }, { eax: 0x2FFFFFFE }, '', 'c');
        ti(test, txt, { eax: 0x80000001, ecx: 0x80000002 }, { eax: 0x00000003 }, '', 'cpo');
        ti(test, txt, { eax: 0x30000000, ecx: 0xD0000000 }, { eax: 0x00000000 }, '', 'cpz');
        ti(test, txt, { eax: 0xAE324F38, ecx: 0xC1235138 }, { eax: 0x6F55A070 }, '', 'cao');
        test.done();
    },
};
exports.default = tests;
//# sourceMappingURL=test_x86_arithmetic.js.map