import MemoryManager from './memory';

export interface X86Registers {
  eax: number;
  ecx: number;
  edx: number;
  ebx: number;
  esi: number;
  edi: number;
  ebp: number;
  esp: number;
  eip: number;
  eflags: number;
  // TODO: segment registers
}

export const enum X86Flag {
  CF = 0,
  PF = 2,
  AF = 4,
  ZF = 6,
  SF = 7,
  TF = 8,
  IF = 9,
  DF = 10,
  OF = 11,
}

export default class X86 {
  private regs: X86Registers;
  private mem: MemoryManager;

  constructor(mem: MemoryManager, regs: X86Registers) {
    this.mem = mem;
    this.regs = regs;
  }

  getRegisters(): X86Registers {
    return this.regs;
  }

  getFlag(flag: X86Flag): boolean {
    return (this.regs.eflags & (1 << <number>flag)) !== 0;
  }

  step(): void {
    // TODO: this
  }
}

