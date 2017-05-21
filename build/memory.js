"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./address");
const address_2 = require("./address");
const sigsegv_1 = require("./error/sigsegv");
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
//# sourceMappingURL=memory.js.map