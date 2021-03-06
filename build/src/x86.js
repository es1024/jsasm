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
var X86SReg;
(function (X86SReg) {
    X86SReg[X86SReg["ES"] = 0] = "ES";
    X86SReg[X86SReg["CS"] = 1] = "CS";
    X86SReg[X86SReg["SS"] = 2] = "SS";
    X86SReg[X86SReg["DS"] = 3] = "DS";
    X86SReg[X86SReg["FS"] = 4] = "FS";
    X86SReg[X86SReg["GS"] = 5] = "GS";
})(X86SReg || (X86SReg = {}));
const ARITH_FLAG_CLEAR = ~((1 << 11) | (1 << 7) | (1 << 6)
    | (1 << 4) | (1 << 2) | (1 << 0));
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
        this.sregs = new Uint16Array(6);
        this.sregs[0] = regs.es;
        this.sregs[1] = regs.cs;
        this.sregs[2] = regs.ss;
        this.sregs[3] = regs.ds;
        this.sregs[4] = regs.fs;
        this.sregs[5] = regs.gs;
        this.add = this.add.bind(this);
        this.or = this.or.bind(this);
        this.adc = this.adc.bind(this);
        this.sbb = this.sbb.bind(this);
        this.and = this.and.bind(this);
        this.sub = this.sub.bind(this);
        this.xor = this.xor.bind(this);
        this.pushpop = this.pushpop.bind(this);
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
            es: this.sregs[0],
            cs: this.sregs[1],
            ss: this.sregs[2],
            ds: this.sregs[3],
            fs: this.sregs[4],
            gs: this.sregs[5],
        };
    }
    setRegisters(regs) {
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
        this.sregs[0] = regs.es;
        this.sregs[1] = regs.cs;
        this.sregs[2] = regs.ss;
        this.sregs[3] = regs.ds;
        this.sregs[4] = regs.fs;
        this.sregs[5] = regs.gs;
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
    getMemoryManager() {
        return this.mem;
    }
    step() {
        const op = this.nextInstByte();
        const d = !!(op & 0x02);
        const w = !!(op & 0x01);
        let tmp;
        switch (op >>> 2) {
            case 0:
                this.processModRegRM(d, w, true, this.add);
                break;
            case 1:
                if (!d) {
                    this.processImm(w, 0, true, this.add);
                }
                else {
                    this.sregs[0] = this.pushpop(this.sregs[0], 0, w);
                }
                break;
            case 2:
                this.processModRegRM(d, w, true, this.or);
                break;
            case 3:
                if (!d) {
                    this.processImm(w, 0, true, this.or);
                }
                else if (!w) {
                    this.pushpop(this.sregs[1], 0, false);
                }
                else {
                    throw new sigill_1.default('multibyte ops not implemented');
                }
                break;
            case 4:
                this.processModRegRM(d, w, true, this.adc);
                break;
            case 5:
                if (!d) {
                    this.processImm(w, 0, true, this.adc);
                }
                else {
                    this.sregs[2] = this.pushpop(this.sregs[2], 0, w);
                }
                break;
            case 6:
                this.processModRegRM(d, w, true, this.sbb);
                break;
            case 7:
                if (!d) {
                    this.processImm(w, 0, true, this.sbb);
                }
                else {
                    this.sregs[3] = this.pushpop(this.sregs[3], 0, w);
                }
                break;
            case 8:
                this.processModRegRM(d, w, true, this.and);
                break;
            case 9:
                if (!d) {
                    this.processImm(w, 0, true, this.and);
                }
                else {
                    throw new sigill_1.default('unimplemented');
                }
                break;
            case 10:
                this.processModRegRM(d, w, true, this.sub);
                break;
            case 11:
                if (!d) {
                    this.processImm(w, 0, true, this.sub);
                }
                else {
                    throw new sigill_1.default('unimplemented');
                }
                break;
            case 12:
                this.processModRegRM(d, w, true, this.xor);
                break;
            case 13:
                if (!d) {
                    this.processImm(w, 0, true, this.xor);
                }
                else {
                    throw new sigill_1.default('unimplemented');
                }
                break;
            case 14:
                this.processModRegRM(d, w, false, this.sub);
                break;
            case 15:
                if (!d) {
                    this.processImm(w, 0, false, this.sub);
                }
                else {
                    throw new sigill_1.default('unimplemented');
                }
                break;
            case 16:
            case 17:
                tmp = this.regs[9] & (1 << 0);
                this.regs[op & 0x7] = this.add(this.regs[op & 0x7], 1, true);
                this.regs[9] &= ~(1 << 0);
                this.regs[9] |= tmp;
                break;
            case 18:
            case 19:
                tmp = this.regs[9] & (1 << 0);
                this.regs[op & 0x7] = this.sub(this.regs[op & 0x7], 1, true);
                this.regs[9] &= ~(1 << 0);
                this.regs[9] |= tmp;
                break;
            case 20:
            case 21:
            case 22:
            case 23:
                this.regs[op & 0x7] = this.pushpop(this.regs[op & 0x7], 0, op >= 0x58);
                break;
            case 28:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 11)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & (1 << 0)) != 0);
                }
                break;
            case 29:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 6)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & ((1 << 0) |
                        (1 << 6))) != 0);
                }
                break;
            case 30:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 7)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & (1 << 2)) != 0);
                }
                break;
            case 31:
                if (!d) {
                    this.processJump(w, ((this.regs[9] & (1 << 7)) == 0)
                        != ((this.regs[9] & (1 << 11)) == 0));
                }
                else {
                    this.processJump(w, (this.regs[9] & (1 << 6)) != 0
                        || ((this.regs[9] & (1 << 7)) == 0)
                            != ((this.regs[9] & (1 << 11)) == 0));
                }
                break;
            case 35:
                if (!d && w) {
                    const modRM = this.nextInstByte();
                    const mod = modRM >>> 6;
                    if (mod == 3) {
                        throw new sigill_1.default('lea mode 3');
                    }
                    this.processToReg((mod >>> 3) & 0x7, true, true, modRM, (a, mod, w) => this.getEffectiveAddr(mod));
                }
                else {
                    throw new sigill_1.default('unimplemented');
                }
                break;
            case 36:
                if (!d && !w) {
                    break;
                }
            default:
                throw new sigill_1.default('probably just unimplemented or something');
        }
    }
    nextInstByte() {
        const tw = this.mem.readWord(this.regs[8] & ~0x3);
        const offs = this.regs[8] & 0x3;
        const op = (tw >>> (offs << 3)) & 0xFF;
        ++this.regs[8];
        return op;
    }
    getEffectiveAddr(modRM) {
        const mod = modRM >>> 6;
        let RM = modRM & 0x7;
        let offset = 0;
        let scale = 1;
        let index = 0;
        let base = RM;
        let addr = 0;
        if (RM == 4) {
            const SIB = this.nextInstByte();
            scale = SIB >>> 6;
            index = (SIB >>> 3) & 0x7;
            base = SIB & 0x7;
        }
        switch (mod) {
            case 2:
                offset |= this.nextInstByte();
                offset |= this.nextInstByte() << 8;
                offset |= this.nextInstByte() << 16;
            case 1:
                offset |= this.nextInstByte() << 24;
                if (mod == 1) {
                    offset >>= 24;
                }
            case 0:
                if (base == 5 && mod == 0) {
                    addr |= this.nextInstByte();
                    addr |= this.nextInstByte() << 8;
                    addr |= this.nextInstByte() << 16;
                    addr |= this.nextInstByte() << 24;
                }
                else {
                    addr = this.regs[base] + offset;
                }
                if (RM == 4 && index != 4) {
                    addr += this.regs[index] << scale;
                }
                addr &= 0xFFFFFFFF;
                return addr;
        }
        return 0;
    }
    processModRegRM(d, w, k, f) {
        const modRM = this.nextInstByte();
        const mod = modRM >>> 6;
        let reg = (modRM >>> 3) & 0x7;
        if (mod < 3) {
            const addr = this.getEffectiveAddr(modRM);
            let memVal = 0;
            let memA = 0, memB = 0, maskTop = 0, maskBottom = 0, cTop = 0, cBottom = 0;
            if (!w) {
                memA = this.mem.readWord(addr & ~0x3);
                memVal = (memA >>> ((addr & 0x3) << 3)) & 0xFF;
            }
            else if ((addr & 0x3) == 0) {
                memVal = this.mem.readWord(addr);
            }
            else {
                cTop = (4 - (addr & 0x3)) << 3;
                cBottom = (addr & 0x3) << 3;
                maskBottom = (1 << cBottom) - 1;
                maskTop = ~maskBottom;
                memA = this.mem.readWord(addr & ~0x3);
                memB = this.mem.readWord((addr & ~0x3) + 4);
                memVal = memB & maskBottom;
                memVal <<= cTop;
                memVal |= memA >>> cBottom;
            }
            if (d) {
                this.processToReg(reg, w, k, memVal, f);
            }
            else {
                const v = f(memVal, this.getReg(reg, w), w);
                if (!k) {
                    return;
                }
                if (w) {
                    if ((addr & 0x3) == 0) {
                        this.mem.writeWord(addr, v);
                    }
                    else {
                        memA &= maskBottom;
                        memB &= maskTop;
                        memA |= (v & ((1 << cTop) - 1)) << cBottom;
                        memB |= ((v & ~((1 << cTop) - 1)) >>> cTop);
                        this.mem.writeWord(addr & ~0x3, memA);
                        this.mem.writeWord((addr & ~0x3) + 4, memB);
                    }
                }
                else {
                    const offs = (addr & 0x3) << 3;
                    memA &= ~(0xFF << offs);
                    memA |= v << offs;
                    this.mem.writeWord(addr & ~0x3, memA);
                }
            }
        }
        else {
            let RM = modRM & 0x7;
            if (d) {
                const tmp = reg;
                reg = RM;
                RM = tmp;
            }
            this.processToReg(RM, w, k, this.getReg(reg, w), f);
        }
    }
    getReg(reg, w) {
        let rv = this.regs[reg];
        if (!w) {
            const regr = reg & 0x3;
            const regs = (reg & 0x4) << 1;
            rv = (this.regs[regr] & (0xFF << regs)) >>> regs;
        }
        return rv;
    }
    processToReg(reg, w, k, other, f) {
        const v = f(this.getReg(reg, w), other, w);
        if (k) {
            if (w) {
                this.regs[reg] = v;
            }
            else {
                const regr = reg & 0x3;
                const regs = (reg & 0x4) << 1;
                this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | v << regs;
            }
        }
    }
    processImm(w, reg, k, f) {
        let imm;
        if (w) {
            imm = this.nextInstByte();
            imm |= this.nextInstByte() << 8;
            imm |= this.nextInstByte() << 16;
            imm |= this.nextInstByte() << 24;
            if (imm < 0) {
                imm += 0x100000000;
            }
        }
        else {
            imm = this.nextInstByte();
        }
        this.processToReg(reg, w, k, imm, f);
    }
    processJump(negate, cond) {
        let offset;
        offset = this.nextInstByte();
        if (offset > 127) {
            offset -= 256;
        }
        if (negate != cond) {
            this.regs[8] += offset;
        }
    }
    parity(a) {
        a ^= a >>> 4;
        a &= 0xF;
        return (~(0x6996 >>> a)) & 1;
    }
    add(a, b, w) {
        this.regs[9] &= ARITH_FLAG_CLEAR;
        return this.adc(a, b, w);
    }
    or(a, b, w) {
        const r = a | b;
        const m = w ? 0xFFFFFFFF : 0xFF;
        const n = w ? 0x80000000 : 0x80;
        this.regs[9] &= ARITH_FLAG_CLEAR;
        this.regs[9] |= ((r & n) != 0 ? 1 : 0) << 7;
        this.regs[9] |= ((r & m) == 0 ? 1 : 0) << 6;
        this.regs[9] |= this.parity(a) << 2;
        return r;
    }
    adc(a, b, w) {
        const cf = (this.regs[9] >>> 0) & 1;
        if (a < 0) {
            a += 0x100000000;
        }
        if (b < 0) {
            b += 0x100000000;
        }
        const r = a + b + cf;
        const m = w ? 0xFFFFFFFF : 0xFF;
        const n = w ? 0x80000000 : 0x80;
        this.regs[9] &= ARITH_FLAG_CLEAR;
        this.regs[9] |= ((a & n) == (b & n) && (a & n) != (r & n) ? 1 : 0)
            << 11;
        this.regs[9] |= ((r & n) != 0 ? 1 : 0) << 7;
        this.regs[9] |= ((r & m) == 0 ? 1 : 0) << 6;
        this.regs[9] |= ((a & 0xF) + (b & 0xF) + cf > 0xF ? 1 : 0)
            << 4;
        this.regs[9] |= this.parity(r) << 2;
        this.regs[9] |= (r > m ? 1 : 0) << 0;
        return r & m;
    }
    sbb(a, b, w) {
        const cf = (this.regs[9] & (1 << 0)) != 0 ? 1 : 0;
        this.regs[9] ^= 1 << 0;
        const r = this.adc(a, (~b) & (w ? 0xFFFFFFFF : 0xFF), w);
        this.regs[9] ^= 1 << 0;
        this.regs[9] &= ~(1 << 4);
        this.regs[9] |= ((a & 0xF) < (b & 0xF) + cf ? 1 : 0) << 4;
        return r;
    }
    and(a, b, w) {
        const r = a & b;
        const m = w ? 0xFFFFFFFF : 0xFF;
        const n = w ? 0x80000000 : 0x80;
        this.regs[9] &= ARITH_FLAG_CLEAR;
        this.regs[9] |= ((r & n) != 0 ? 1 : 0) << 7;
        this.regs[9] |= ((r & m) == 0 ? 1 : 0) << 6;
        this.regs[9] |= this.parity(a) << 2;
        return r;
    }
    sub(a, b, w) {
        this.regs[9] &= ARITH_FLAG_CLEAR;
        return this.sbb(a, b, w);
    }
    xor(a, b, w) {
        const r = a ^ b;
        const m = w ? 0xFFFFFFFF : 0xFF;
        const n = w ? 0x80000000 : 0x80;
        this.regs[9] &= ARITH_FLAG_CLEAR;
        this.regs[9] |= ((r & n) != 0 ? 1 : 0) << 7;
        this.regs[9] |= ((r & m) == 0 ? 1 : 0) << 6;
        this.regs[9] |= this.parity(a) << 2;
        return r;
    }
    pushpop(a, _, pop) {
        if (!pop) {
            this.regs[4] -= 4;
            if ((this.regs[4] & 0x3) == 0) {
                this.mem.writeWord(this.regs[4], a);
            }
            return a;
        }
        else {
            let value = 0;
            if ((this.regs[4] & 0x3) == 0) {
                value = this.mem.readWord(this.regs[4]);
            }
            this.regs[4] += 4;
            return value;
        }
    }
}
exports.default = X86;
//# sourceMappingURL=x86.js.map