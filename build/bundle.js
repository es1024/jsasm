/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MIN_ADDR = 0;
const MAX_ADDR = 0x7FFFFFFF | 0;
exports.TEXT_MASK = 0x10000000;
exports.STACK_MASK = 0x40000000;
exports.OFFSET_MASK = 0x0FFFFFFF;
function isAddress(addr) {
    return addr === +addr && addr == (addr | 0) && MIN_ADDR <= addr &&
        addr <= MAX_ADDR;
}
exports.isAddress = isAddress;
function isTextAddress(addr) {
    return isAddress(addr) && (addr & exports.TEXT_MASK) !== 0;
}
exports.isTextAddress = isTextAddress;
function isStackAddress(addr) {
    return (addr & exports.STACK_MASK) !== 0;
}
exports.isStackAddress = isStackAddress;
function getAddressOffset(addr) {
    return (addr & exports.OFFSET_MASK);
}
exports.getAddressOffset = getAddressOffset;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class SIGBASE extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGBASE.prototype);
    }
}
exports.default = SIGBASE;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = __webpack_require__(0);
const memory_1 = __webpack_require__(5);
const x86_1 = __webpack_require__(6);
let mem = null;
let x86Machine = null;
function toHex(val) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    const tmp = '00000000' + val.toString(16).toUpperCase();
    return tmp.substring(tmp.length - 8);
}
function syncRegs() {
    const regs = x86Machine.getRegisters();
    document.getElementById('reg-eax').value = toHex(regs.eax);
    document.getElementById('reg-ecx').value = toHex(regs.ecx);
    document.getElementById('reg-edx').value = toHex(regs.edx);
    document.getElementById('reg-ebx').value = toHex(regs.ebx);
    document.getElementById('reg-esi').value = toHex(regs.esi);
    document.getElementById('reg-edi').value = toHex(regs.edi);
    document.getElementById('reg-ebp').value = toHex(regs.ebp);
    document.getElementById('reg-esp').value = toHex(regs.esp);
    document.getElementById('reg-eip').value = toHex(regs.eip);
    document.getElementById('reg-eflags').value = toHex(regs.eflags);
}
function syncFlags() {
    document.getElementById('flg-cf').checked = x86Machine.getFlag(0);
    document.getElementById('flg-pf').checked = x86Machine.getFlag(2);
    document.getElementById('flg-af').checked = x86Machine.getFlag(4);
    document.getElementById('flg-zf').checked = x86Machine.getFlag(6);
    document.getElementById('flg-sf').checked = x86Machine.getFlag(7);
    document.getElementById('flg-tf').checked = x86Machine.getFlag(8);
    document.getElementById('flg-if').checked = x86Machine.getFlag(9);
    document.getElementById('flg-df').checked = x86Machine.getFlag(10);
    document.getElementById('flg-of').checked = x86Machine.getFlag(11);
}
function init(src) {
    mem = new memory_1.default({
        textLength: 65536,
        stackLength: 65536,
    });
    src = src.toUpperCase().replace(/[^\dA-F]/g, '');
    const words = src.match(/.{1,8}/g);
    for (let i = 0; i < words.length; ++i) {
        const tmp = words[i].match(/.{1,2}/g);
        tmp.reverse();
        mem.writeWord(address_1.TEXT_MASK | (i << 2), parseInt(tmp.join(''), 16));
    }
    x86Machine = new x86_1.default(mem, {
        eax: 0,
        ecx: 0,
        edx: 0,
        ebx: 0,
        esi: 0,
        edi: 0,
        ebp: 0,
        esp: mem.getStackTopAddr(),
        eip: mem.getTextBaseAddr(),
        eflags: (1 << 1) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 15),
    });
}
function run() {
}
function step() {
    if (x86Machine == null) {
        init(document.getElementById('x86-src').value);
    }
    x86Machine.step();
    syncRegs();
    syncFlags();
}
function stop() {
}
window.run = run;
window.step = step;
window.stop = stop;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sigbase_1 = __webpack_require__(1);
class SIGILL extends sigbase_1.default {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGILL.prototype);
    }
}
exports.default = SIGILL;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sigbase_1 = __webpack_require__(1);
class SIGSEGV extends sigbase_1.default {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGSEGV.prototype);
    }
}
exports.default = SIGSEGV;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = __webpack_require__(0);
const address_2 = __webpack_require__(0);
const sigsegv_1 = __webpack_require__(4);
class MemoryManager {
    constructor(sl) {
        this.text = new Uint32Array(sl.textLength >> 2);
        this.stack = new Uint32Array(sl.stackLength >> 2);
    }
    getTextBaseAddr() {
        return address_2.TEXT_MASK;
    }
    getTextTopAddr() {
        return address_2.TEXT_MASK | (this.text.length << 2);
    }
    getStackBaseAddr() {
        return address_2.STACK_MASK;
    }
    getStackTopAddr() {
        return address_2.STACK_MASK | (this.stack.length << 2);
    }
    readWord(addr) {
        let offset = address_1.getAddressOffset(addr);
        if ((offset & 0x3) != 0) {
            throw new sigsegv_1.default('malaligned address');
        }
        offset >>= 2;
        if (address_1.isTextAddress(addr)) {
            if (offset >= this.text.length) {
                throw new sigsegv_1.default('text segment address out of bounds');
            }
            return this.text[offset];
        }
        else if (address_1.isStackAddress(addr)) {
            if (offset >= this.stack.length) {
                throw new sigsegv_1.default('stack segment address out of bounds');
            }
            return this.stack[offset];
        }
        throw new sigsegv_1.default('bad address');
    }
    writeWord(addr, value) {
        let offset = address_1.getAddressOffset(addr);
        if ((offset & 0x3) != 0) {
            throw new sigsegv_1.default('malaligned address');
        }
        offset >>= 2;
        if (address_1.isTextAddress(addr)) {
            if (offset >= this.text.length) {
                throw new sigsegv_1.default('text segment address out of bounds');
            }
            this.text[offset] = value;
        }
        else if (address_1.isStackAddress(addr)) {
            if (offset >= this.stack.length) {
                throw new sigsegv_1.default('stack segment address out of bounds');
            }
            this.stack[offset] = value;
        }
        else {
            throw new sigsegv_1.default('bad address');
        }
    }
}
exports.default = MemoryManager;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sigill_1 = __webpack_require__(3);
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
const ARITH_FLAG_CLEAR = ~((1 << 11) | (1 << 7) |
    (1 << 6) | (1 << 4) |
    (1 << 2) | (1 << 0));
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
        this.or = this.or.bind(this);
        this.adc = this.adc.bind(this);
        this.sbb = this.sbb.bind(this);
        this.and = this.and.bind(this);
        this.sub = this.sub.bind(this);
        this.xor = this.xor.bind(this);
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
                this.processModRegRM(d, w, true, this.add);
                break;
            case 2:
                this.processModRegRM(d, w, true, this.or);
                break;
            case 4:
                this.processModRegRM(d, w, true, this.adc);
                break;
            case 6:
                this.processModRegRM(d, w, true, this.sbb);
                break;
            case 8:
                this.processModRegRM(d, w, true, this.and);
                break;
            case 10:
                this.processModRegRM(d, w, true, this.sub);
                break;
            case 12:
                this.processModRegRM(d, w, true, this.xor);
                break;
            case 14:
                this.processModRegRM(d, w, false, this.sub);
                break;
            default:
                throw new sigill_1.default('probably just unimplemented or something');
        }
    }
    nextInstByte() {
        const tw = this.mem.readWord(this.regs[8] & ~0x3);
        const offs = this.regs[8] & 0x3;
        const op = (tw >> (offs << 3)) & 0xFF;
        ++this.regs[8];
        return op;
    }
    processModRegRM(d, w, k, f) {
        const modRM = this.nextInstByte();
        const mod = modRM >> 6;
        let reg = (modRM >> 3) & 0x7;
        let RM = modRM & 0x7;
        let offset = 0;
        let scale = 1;
        let index = 0;
        let base = RM;
        let addr = 0;
        if (mod < 3 && RM == 5) {
            const SIB = this.nextInstByte();
            scale = SIB >> 6;
            index = (SIB >> 3) & 0x7;
            base = SIB & 0x7;
            if (base == 5) {
                throw new sigill_1.default('SIB base=5');
            }
        }
        switch (mod) {
            case 2:
                offset &= this.nextInstByte();
                offset &= this.nextInstByte() << 8;
                offset &= this.nextInstByte() << 16;
            case 1:
                offset &= this.nextInstByte() << 24;
                if (mod == 1) {
                    offset >>= 24;
                }
            case 0:
                if (base == 6 && mod == 0) {
                    addr &= this.nextInstByte();
                    addr &= this.nextInstByte() << 8;
                    addr &= this.nextInstByte() << 16;
                    addr &= this.nextInstByte() << 24;
                }
                else {
                    addr = this.regs[base] + offset;
                }
                if (RM == 5) {
                    addr += index << scale;
                }
                addr &= 0xFFFFFFFF;
                let memVal = 0;
                let memA = 0, memB = 0, maskTop = 0, maskBottom = 0, cTop = 0, cBottom = 0;
                if ((addr & 0x3) == 0) {
                    memVal = this.mem.readWord(addr);
                }
                else {
                    cTop = ((~addr) & 0x3) << 3;
                    cBottom = (addr & 0x3) << 3;
                    maskBottom = (1 << cBottom) - 1;
                    maskTop = ~maskBottom;
                    memA = this.mem.readWord(addr & ~0x3);
                    memB = this.mem.readWord((addr & ~0x3) + 4);
                    memVal = memB & maskBottom;
                    memVal <<= cTop;
                    memVal &= memA >> cBottom;
                }
                if (d) {
                    const v = f(this.regs[reg], memVal, w);
                    if (k) {
                        this.regs[reg] = v;
                    }
                }
                else {
                    const v = f(memVal, this.regs[reg], w);
                    if (k) {
                        if ((addr & 0x3) == 0) {
                            this.mem.writeWord(addr, v);
                        }
                        else {
                            memA &= maskBottom;
                            memB &= maskTop;
                            memA |= (v & ((1 << cTop) - 1)) << cBottom;
                            memB |= (v & ~((1 << cTop) - 1));
                            this.mem.writeWord(addr & ~0x3, memA);
                            this.mem.writeWord((addr & ~0x3) + 4, memB);
                        }
                    }
                }
                break;
            case 3:
                if (d) {
                    const tmp = reg;
                    reg = RM;
                    RM = tmp;
                }
                if (w) {
                    const v = f(this.regs[RM], this.regs[reg], w);
                    if (k) {
                        this.regs[RM] = v;
                    }
                }
                else {
                    const RMr = RM & 0x3;
                    const regr = reg & 0x3;
                    const RMs = RM & 0x4;
                    const regs = reg & 0x4;
                    const tmp = f((this.regs[RMr] & (0xFF << RMs)) >> RMs, (this.regs[regr] & (0xFF << regs)) >> regs, w);
                    if (k) {
                        this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
                    }
                }
                break;
        }
    }
    parity(a) {
        a ^= a >> 4;
        a &= 0xF;
        return (~(0x6996 >> a)) & 1;
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
        const cf = (this.regs[9] >> 0) & 1;
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
        this.regs[9] |= this.parity(a) << 2;
        this.regs[9] |= ((r & m) != (r | 0) ? 1 : 0) << 0;
        return r & m;
    }
    sbb(a, b, w) {
        this.regs[9] ^= 1 << 0;
        const r = this.adc(a, (w ? 0x100000000 : 0x100) - b, w);
        this.regs[9] ^= 1 << 0;
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
}
exports.default = X86;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map