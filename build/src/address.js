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
//# sourceMappingURL=address.js.map