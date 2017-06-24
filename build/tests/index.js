"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Suite = require("testjs");
const test_x86_core_1 = require("./test_x86_core");
const test_x86_arithmetic_generated_1 = require("./test_x86_arithmetic.generated");
const tests = {
    'core': test_x86_core_1.default,
    'arithmetic': test_x86_arithmetic_generated_1.default,
};
Suite.run(tests, 'x86');
//# sourceMappingURL=index.js.map