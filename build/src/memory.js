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
//# sourceMappingURL=memory.js.map