jsasm
=====

x86 bytecode interpreter written in JavaScript (well, TypeScript).

Most instructions are not yet supported: only basic arithmetic (add, adc, sbb,
sub), bitwise operators (or, and, xor), cmp, conditional jumps (ja, jb, jz,
etc.), nop, and lea are supported. Full support of mod/reg/RM and SIB, but more
complex use has not been thoroughly tested yet, and may be buggy.

The purpose of this project is TBD.

