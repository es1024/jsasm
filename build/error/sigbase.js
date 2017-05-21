"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SIGBASE extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGBASE.prototype);
    }
}
exports.default = SIGBASE;
//# sourceMappingURL=sigbase.js.map