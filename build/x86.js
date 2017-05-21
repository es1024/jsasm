"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var X86Flag;
(function (X86Flag) {
    X86Flag[X86Flag["CF"] = 0] = "CF";
    X86Flag[X86Flag["PF"] = 2] = "PF";
    X86Flag[X86Flag["AF"] = 4] = "AF";
    X86Flag[X86Flag["ZF"] = 6] = "ZF";
    X86Flag[X86Flag["SF"] = 7] = "SF";
    X86Flag[X86Flag["TF"] = 8] = "TF";
    X86Flag[X86Flag["IF"] = 9] = "IF";
    X86Flag[X86Flag["DF"] = 10] = "DF";
    X86Flag[X86Flag["OF"] = 11] = "OF";
})(X86Flag = exports.X86Flag || (exports.X86Flag = {}));
class X86 {
    constructor(mem, regs) {
        this.mem = mem;
        this.regs = regs;
    }
    getRegisters() {
        return this.regs;
    }
    getFlag(flag) {
        return (this.regs.eflags & (1 << flag)) !== 0;
    }
    step() {
    }
}
exports.default = X86;
//# sourceMappingURL=x86.js.map