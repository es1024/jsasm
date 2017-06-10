"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const ti = helpers_1.testInst;
const tests = {
    'inst 00 - add r/m8, r/8': function (test) {
        const txt = [0x00, 0xC8];
        ti(test, txt, { eax: 0x55, ecx: 0x66 }, { eax: 0xBB }, '', 'pso');
        ti(test, txt, { eax: 0xFE, ecx: 0x30 }, { eax: 0x2E }, '', 'c');
        ti(test, txt, { eax: 0x81, ecx: 0x82 }, { eax: 0x03 }, '', 'cpo');
        ti(test, txt, { eax: 0x30, ecx: 0xD0 }, { eax: 0x00 }, '', 'cpz');
        ti(test, txt, { eax: 0x38, ecx: 0x38 }, { eax: 0x70 }, '', 'a');
        test.done();
    }
};
exports.default = tests;
//# sourceMappingURL=test_x86_arithmetic.js.map