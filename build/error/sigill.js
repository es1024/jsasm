"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sigbase_1 = require("./sigbase");
class SIGILL extends sigbase_1.default {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGILL.prototype);
    }
}
exports.default = SIGILL;
//# sourceMappingURL=sigill.js.map