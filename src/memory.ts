import {getAddressOffset, isTextAddress, isStackAddress} from './address';
import {TEXT_MASK, STACK_MASK} from './address';
import SIGSEGV from './error/sigsegv';

interface SegmentLength {
  textLength: number;
  stackLength: number;
}

export default class MemoryManager {
  private text: Uint32Array;
  private stack: Uint32Array;

  constructor(sl: SegmentLength) {
    this.text = new Uint32Array(sl.textLength >> 2);
    this.stack = new Uint32Array(sl.stackLength >> 2);
  }

  getTextBaseAddr(): number {
    return TEXT_MASK;
  }

  getTextTopAddr(): number {
    return TEXT_MASK | (this.text.length << 2);
  }

  getStackBaseAddr(): number {
    return STACK_MASK;
  }

  getStackTopAddr(): number {
    return STACK_MASK | (this.stack.length << 2);
  }

  readWord(addr: number): number {
    const offset = getAddressOffset(addr);
    if ((offset & 0x3) != 0) {
      throw new SIGSEGV('malaligned address');
    }
    offset >>= 2;
    if (isTextAddress(addr)) {
      if (offset >= this.text.length) {
        throw new SIGSEGV('text segment address out of bounds');
      }
      return this.text[offset];
    } else if (isStackAddress(addr)) {
      if (offset >= this.stack.length) {
        throw new SIGSEGV('stack segment address out of bounds');
      }
      return this.stack[offset];
    }
    throw new SIGSEGV('bad address');
  }

  writeWord(addr: number, value: number): void {
    const offset = getAddressOffset(addr);
    if ((offset & 0x3) != 0) {
      throw new SIGSEGV('malaligned address');
    }
    offset >>= 2;
    if (isTextAddress(addr)) {
      if (offset >= this.text.length) {
        throw new SIGSEGV('text segment address out of bounds');
      }
      this.text[offset] = value;
    } else if (isStackAddress(addr)) {
      if (offset >= this.stack.length) {
        throw new SIGSEGV('stack segment address out of bounds');
      }
      this.stack[offset] = value;
    } else {
      throw new SIGSEGV('bad address');
    }
  }
}

