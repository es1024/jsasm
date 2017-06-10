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
    sigtype() {
        return 'SIGBASE (this should not happen)';
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
const sigbase_1 = __webpack_require__(1);
const x86_1 = __webpack_require__(6);
let mem = null;
let x86Machine = null;
let started = false;
function toHex(val, minlen) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    const tmp = '00000000' + val.toString(16).toUpperCase();
    return tmp.substring(tmp.length - minlen);
}
function syncRegs() {
    const regs = x86Machine.getRegisters();
    document.getElementById('reg-eax').value = toHex(regs.eax, 8);
    document.getElementById('reg-ecx').value = toHex(regs.ecx, 8);
    document.getElementById('reg-edx').value = toHex(regs.edx, 8);
    document.getElementById('reg-ebx').value = toHex(regs.ebx, 8);
    document.getElementById('reg-esi').value = toHex(regs.esi, 8);
    document.getElementById('reg-edi').value = toHex(regs.edi, 8);
    document.getElementById('reg-ebp').value = toHex(regs.ebp, 8);
    document.getElementById('reg-esp').value = toHex(regs.esp, 8);
    document.getElementById('reg-eip').value = toHex(regs.eip, 8);
    document.getElementById('reg-eflags').value = toHex(regs.eflags, 8);
    document.getElementById('reg-es').value = toHex(regs.es, 4);
    document.getElementById('reg-cs').value = toHex(regs.cs, 4);
    document.getElementById('reg-ss').value = toHex(regs.ss, 4);
    document.getElementById('reg-ds').value = toHex(regs.ds, 4);
    document.getElementById('reg-fs').value = toHex(regs.fs, 4);
    document.getElementById('reg-gs').value = toHex(regs.gs, 4);
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
    const words = src.match(/.{1,8}/g) || [];
    for (let i = 0; i < words.length; ++i) {
        const tmp = words[i].match(/.{1,2}/g);
        tmp.reverse();
        mem.writeWord(address_1.TEXT_MASK | (i << 2), parseInt(tmp.join(''), 16));
    }
    let regs = {
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
        es: 0,
        cs: 0,
        ss: 0,
        ds: 0,
        fs: 0,
        gs: 0,
    };
    if (x86Machine != null && !started) {
        regs = x86Machine.getRegisters();
    }
    x86Machine = new x86_1.default(mem, regs);
}
function run() {
    document.getElementById('x86-error').innerHTML = 'unimplemented';
}
function step() {
    if (x86Machine == null || !started) {
        init(document.getElementById('x86-src').value);
    }
    started = true;
    try {
        x86Machine.step();
    }
    catch (e) {
        if (e instanceof sigbase_1.default) {
            document.getElementById('x86-error').innerHTML =
                e.sigtype() + ': ' + e.message;
            return;
        }
        else {
            document.getElementById('x86-error').innerHTML = 'Unknown error';
            throw e;
        }
    }
    syncRegs();
    syncFlags();
}
function stop() {
    document.getElementById('x86-error').innerHTML = 'unimplemented';
}
function reset() {
    x86Machine = null;
    init(document.getElementById('x86-src').value);
    syncRegs();
    syncFlags();
    started = false;
    document.getElementById('x86-error').innerHTML = '';
}
const longRegs = ['eax', 'ecx', 'edx', 'ebx', 'esp', 'ebp', 'esi', 'edi', 'eip',
    'eflags'];
const shortRegs = ['es', 'cs', 'ss', 'ds', 'fs', 'gs'];
const flags = {
    cf: 0,
    pf: 2,
    af: 4,
    zf: 6,
    sf: 7,
    tf: 8,
    if: 9,
    df: 10,
    of: 11,
};
const flagNames = Object.keys(flags);
function updateReg(reg, len) {
    const sval = document.getElementById('reg-' + reg).value;
    let val = parseInt(sval, 16) | 0;
    if (len == 8) {
        val &= 0xFF;
    }
    const regs = x86Machine.getRegisters();
    regs[reg] = val;
    x86Machine.setRegisters(regs);
    syncRegs();
    syncFlags();
}
function toggleFlag(flag) {
    const regs = x86Machine.getRegisters();
    regs.eflags ^= 1 << flags[flag];
    x86Machine.setRegisters(regs);
    syncRegs();
    syncFlags();
}
for (let i = longRegs.length; i--;) {
    document.getElementById('reg-' + longRegs[i]).onchange = ((reg) => () => updateReg(reg, 32))(longRegs[i]);
}
for (let i = shortRegs.length; i--;) {
    document.getElementById('reg-' + shortRegs[i]).onchange = ((reg) => () => updateReg(reg, 8))(shortRegs[i]);
}
for (let i = flagNames.length; i--;) {
    document.getElementById('flg-' + flagNames[i]).onchange = ((flag) => () => toggleFlag(flag))(flagNames[i]);
}
window.run = run;
window.step = step;
window.stop = stop;
window.reset = reset;
init('');
syncRegs();
syncFlags();


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
    sigtype() {
        return 'SIGILL';
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
    sigtype() {
        return 'SIGSEGV';
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
            throw new sigsegv_1.default('malaligned address 0x' + addr.toString(16));
        }
        offset >>= 2;
        if (address_1.isTextAddress(addr)) {
            if (offset >= this.text.length) {
                throw new sigsegv_1.default('text segment address out of bounds 0x'
                    + addr.toString(16));
            }
            return this.text[offset];
        }
        else if (address_1.isStackAddress(addr)) {
            if (offset >= this.stack.length) {
                throw new sigsegv_1.default('stack segment address out of bounds 0x'
                    + addr.toString(16));
            }
            return this.stack[offset];
        }
        throw new sigsegv_1.default('bad address 0x' + addr.toString(16));
    }
    writeWord(addr, value) {
        let offset = address_1.getAddressOffset(addr);
        if ((offset & 0x3) != 0) {
            throw new sigsegv_1.default('malaligned address 0x' + addr.toString(16));
        }
        offset >>= 2;
        if (address_1.isTextAddress(addr)) {
            if (offset >= this.text.length) {
                throw new sigsegv_1.default('text segment address out of bounds 0x'
                    + addr.toString(16));
            }
            this.text[offset] = value;
        }
        else if (address_1.isStackAddress(addr)) {
            if (offset >= this.stack.length) {
                throw new sigsegv_1.default('stack segment address out of bounds 0x'
                    + addr.toString(16));
            }
            this.stack[offset] = value;
        }
        else {
            throw new sigsegv_1.default('bad address 0x' + addr.toString(16));
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
                this.regs[9] |= tmp;
                break;
            case 18:
            case 19:
                tmp = this.regs[9] & (1 << 0);
                this.regs[op & 0x7] = this.sub(this.regs[op & 0x7], 1, true);
                this.regs[9] |= tmp;
                break;
            case 20:
            case 21:
            case 22:
            case 23:
                this.regs[op & 0x7] = this.pushpop(this.regs[op & 0x7], 0, op >= 0x58);
                break;
            case 32:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 11)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & (1 << 0)) != 0);
                }
                break;
            case 33:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 6)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & ((1 << 0) |
                        (1 << 6))) != 0);
                }
                break;
            case 34:
                if (!d) {
                    this.processJump(w, (this.regs[9] & (1 << 7)) != 0);
                }
                else {
                    this.processJump(w, (this.regs[9] & (1 << 2)) != 0);
                }
                break;
            case 35:
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
    processModRegRM(d, w, k, f) {
        const modRM = this.nextInstByte();
        const mod = modRM >>> 6;
        let reg = (modRM >>> 3) & 0x7;
        let RM = modRM & 0x7;
        let offset = 0;
        let scale = 1;
        let index = 0;
        let base = RM;
        let addr = 0;
        if (mod < 3 && RM == 4) {
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
                        break;
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
                break;
            case 3:
                if (d) {
                    const tmp = reg;
                    reg = RM;
                    RM = tmp;
                }
                this.processToReg(RM, w, k, this.getReg(reg, w), f);
                break;
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
        if (w) {
            const v = f(this.regs[reg], other, w);
            if (k) {
                this.regs[reg] = v;
            }
        }
        else {
            const tmp = f(this.getReg(reg, w), other, w);
            const regr = reg & 0x3;
            const regs = (reg & 0x4) << 1;
            if (k) {
                this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
            }
        }
    }
    processImm(w, reg, k, f) {
        if (w) {
            let imm = this.nextInstByte();
            imm |= this.nextInstByte() << 8;
            imm |= this.nextInstByte() << 16;
            imm |= this.nextInstByte() << 24;
            let v = f(this.regs[reg], imm, w);
            if (k) {
                this.regs[reg] = v;
            }
        }
        else {
            const imm = this.nextInstByte();
            const regr = reg & 0x3;
            const regs = (reg & 0x4) << 1;
            const tmp = f((this.regs[regr] & (0xFF << regs)) >>> regs, imm, w);
            if (k) {
                this.regs[regr] = (this.regs[regr] & ~(0xFF << regs)) | tmp << regs;
            }
        }
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
        this.regs[9] |= 1 << 0;
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


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map