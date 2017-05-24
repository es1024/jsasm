"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sigbase_1 = require("./sigbase");
class SIGSEGV extends sigbase_1.default {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGSEGV.prototype);
    }
    sigtype() {
        return 'SIGSEGV';
    }
}
exports.default = SIGSEGV;
//# sourceMappingURL=sigsegv.js.map