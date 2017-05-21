const MIN_ADDR = 0;
const MAX_ADDR = 0x7FFFFFFF | 0;

export const TEXT_MASK = 0x10000000;
export const STACK_MASK = 0x40000000;
export const OFFSET_MASK = 0x0FFFFFFF;

export function isAddress(addr: number): boolean {
  return addr === +addr && addr == (addr | 0) && MIN_ADDR <= addr &&
      addr <= MAX_ADDR;
}

// 0001... = text, assumes addr is an address (31 bit number)
export function isTextAddress(addr: number): boolean {
  return isAddress(addr) && (addr & TEXT_MASK) !== 0;
}

// 01..... = stack, assumes addr is an address (31 bit number)
export function isStackAddress(addr: number): boolean {
  return (addr & STACK_MASK) !== 0;
}

// assumes addr is an address (31 bit number)
export function getAddressOffset(addr: number): number {
  return (addr & OFFSET_MASK);
}

