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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
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
const memory_1 = __webpack_require__(4);
const x86_1 = __webpack_require__(5);
let mem = new memory_1.default({
    textLength: 65536,
    stackLength: 65536,
});
let x86Machine = new x86_1.default(mem, {
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
function toHex(val) {
    if (val < 0) {
        val = 0xFFFFFFFF + val + 1;
    }
    return val.toString(16).toUpperCase();
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
    document.getElementById('reg-cf').checked = x86Machine.getFlag(0);
    document.getElementById('reg-pf').checked = x86Machine.getFlag(2);
    document.getElementById('reg-af').checked = x86Machine.getFlag(4);
    document.getElementById('reg-zf').checked = x86Machine.getFlag(6);
    document.getElementById('reg-sf').checked = x86Machine.getFlag(7);
    document.getElementById('reg-tf').checked = x86Machine.getFlag(8);
    document.getElementById('reg-if').checked = x86Machine.getFlag(9);
    document.getElementById('reg-df').checked = x86Machine.getFlag(10);
    document.getElementById('reg-of').checked = x86Machine.getFlag(11);
}
function run() {
}
function step() {
}
function stop() {
}
window.run = run;
window.step = step;
window.stop = stop;


/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sigbase_1 = __webpack_require__(2);
class SIGSEGV extends sigbase_1.default {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, SIGSEGV.prototype);
    }
}
exports.default = SIGSEGV;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = __webpack_require__(0);
const address_2 = __webpack_require__(0);
const sigsegv_1 = __webpack_require__(3);
class MemoryManager {
    constructor(sl) {
        this.text = new Uint32Array(sl.textLength >> 2);
        this.stack = new Uint32Array(sl.stackLength >> 2);
    }
    getTextBaseAddr() {
        return address_2.TEXT_MASK;
    }
    getTextTopAddr() {
        return address_2.TEXT_MASK + this.text.length;
    }
    getStackBaseAddr() {
        return address_2.STACK_MASK;
    }
    getStackTopAddr() {
        return address_2.STACK_MASK + this.stack.length;
    }
    readWord(addr) {
        const offset = address_1.getAddressOffset(addr);
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
        const offset = address_1.getAddressOffset(addr);
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map