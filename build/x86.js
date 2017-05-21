"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sigill_1 = require("./error/sigill");
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
var X86Reg;
(function (X86Reg) {
    X86Reg[X86Reg["EAX"] = 0] = "EAX";
    X86Reg[X86Reg["ECX"] = 1] = "ECX";
    X86Reg[X86Reg["EDX"] = 2] = "EDX";
    X86Reg[X86Reg["EBX"] = 3] = "EBX";
    X86Reg[X86Reg["ESP"] = 4] = "ESP";
    X86Reg[X86Reg["EBP"] = 5] = "EBP";
    X86Reg[X86Reg["ESI"] = 6] = "ESI";
    X86Reg[X86Reg["EDI"] = 7] = "EDI";
    X86Reg[X86Reg["EIP"] = 8] = "EIP";
    X86Reg[X86Reg["EFLAGS"] = 9] = "EFLAGS";
})(X86Reg || (X86Reg = {}));
class X86 {
    constructor(mem, regs) {
        this.mem = mem;
        this.regs = new Uint32Array(10);
        this.regs[0] = regs.eax;
        this.regs[1] = regs.ecx;
        this.regs[2] = regs.edx;
        this.regs[3] = regs.ebx;
        this.regs[4] = regs.esp;
        this.regs[5] = regs.ebp;
        this.regs[6] = regs.esi;
        this.regs[7] = regs.edi;
        this.regs[8] = regs.eip;
        this.regs[9] = regs.eflags;
        this.add = this.add.bind(this);
    }
    getRegisters() {
        return {
            eax: this.regs[0],
            ecx: this.regs[1],
            edx: this.regs[2],
            ebx: this.regs[3],
            esp: this.regs[4],
            ebp: this.regs[5],
            esi: this.regs[6],
            edi: this.regs[7],
            eip: this.regs[8],
            eflags: this.regs[9],
        };
    }
    setFlag(flag, value) {
        if (value) {
            this.regs[9] |= (1 << flag);
        }
        else {
            this.regs[9] &= ~(1 << flag);
        }
    }
    getFlag(flag) {
        return (this.regs[9] & (1 << flag)) !== 0;
    }
    step() {
        const op = this.nextInstByte();
        const d = !!(op & 0x02);
        const w = !!(op & 0x01);
        switch (op >> 2) {
            case 0:
                this.processModRegRM(d, w, this.add);
                break;
            default:
                throw new sigill_1.default('probably just unimplemented or something');
        }
    }
    nextInstByte() {
        const tw = this.mem.readWord((this.regs[8] >> 2) << 2);
        const offs = (~this.regs[8]) & 0x3;
        const op = (tw >> (offs << 3)) & 0xFF;
        ++this.regs[8];
        return op;
    }
    processModRegRM(d, w, f) {
        const modRM = this.nextInstByte();
        let reg = (modRM >> 3) & 0x7;
        let RM = modRM & 0x7;
        switch (modRM >> 6) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                if (d) {
                    const tmp = reg;
                    reg = RM;
                    RM = tmp;
                }
                if (w) {
                    this.regs[RM] = f(this.regs[RM], this.regs[reg], w);
                }
                else {
                    const RMr = RM & 0x3;
                    const regr = reg & 0x3;
                    const RMs = RM & 0x4;
                    const regs = reg & 0x4;
                    const tmp = f((this.regs[RMr] & (0xFF << RMs)) >> RMs, (this.regs[regr] & (0xFF << regs)) >> regs, w);
                    this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
                }
                break;
        }
    }
    parity(a) {
        a ^= a >> 4;
        a &= 0xF;
        return ((0x6996 >> a) & 1) == 0;
    }
    add(a, b, w) {
        const r = a + b;
        const m = w ? 0xFFFFFFFF : 0xFF;
        const n = w ? 0x80000000 : 0x80;
        this.setFlag(11, (a & n) == (b & n) && (a & n) != (r & n));
        this.setFlag(7, (r & n) != 0);
        this.setFlag(6, (r & m) == 0);
        this.setFlag(4, (a & (1 << 3)) != 0 && (b & (1 << 3)) != 0);
        this.setFlag(2, this.parity(a));
        this.setFlag(0, (r & m) != (r | 0));
        return r & m;
    }
}
exports.default = X86;
//# sourceMappingURL=x86.js.map