/* Runs arbitrary code. Must be compiled as 32-bit, and run on a machine with an
 * x86 processor. Only supports Linux + gcc (you'll have to modify the part allocating
 * memory in an executable region for incompatible operating systems).
 *
 * Run as ./run_bytecode EFLAGS EAX ECX EDX EBX ESP EBP ESI EDI bytecode,
 * where each register is just an unsigned 32-bit integer (or - for unset),
 * and bytecode is a stream of 8-bit integers.
 *
 * ESP must be its original value at the end of the bytecode.
 *
 * Output will be all the registers, in the same order as above. */
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>

#define __cdecl __attribute__((__cdecl__))
#define STACK_SIZE 4096

void write_le32(uint8_t *out, uint32_t value) {
    *out++ = value & 0xFF;
    *out++ = (value >> 8) & 0xFF;
    *out++ = (value >> 16) & 0xFF;
    *out++ = (value >> 24) & 0xFF;
}

void run_and_print(uint8_t * const bytecode, size_t length) {
    uint8_t prologue[] = {
        /* 00: */ 0x60,                               // pushad
        /* 01: */ 0x89, 0x25, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, esp
        /* 07: */ 0xBC, 0x00, 0x00, 0x00, 0x00,       // mov esp, ds:???
    };
    uint8_t epilogue[] = {
        /* 00: */ 0xA3, 0x00, 0x00, 0x00, 0x00,       // mov dword ptr ds:???, eax
        /* 05: */ 0x89, 0x0D, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, ecx
        /* 0B: */ 0x89, 0x15, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, edx
        /* 11: */ 0x89, 0x1D, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, ebx
        /* 17: */ 0x89, 0x25, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, esp
        /* 1D: */ 0x89, 0x2D, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, ebp
        /* 23: */ 0x89, 0x35, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, esi
        /* 29: */ 0x89, 0x3D, 0x00, 0x00, 0x00, 0x00, // mov dword ptr ds:???, edi
        /* 2F: */ 0xBC, 0x00, 0x00, 0x00, 0x00,       // mov esp, ds:???
        /* 34: */ 0x9C,                               // pushfd
        /* 35: */ 0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:???
        /* 3B: */ 0x61,                               // popad
        /* 3C: */ 0xC3,                               // ret
    };

    uint32_t outputs[9];
    write_le32(epilogue + 0x37, (uint32_t) outputs); // EFLAGS
    for (int i = 0; i < 8; ++i) {
        write_le32(epilogue + 0x1 + 6 * i, (uint32_t) (outputs + 1 + i));
    }

    uint8_t *mem = mmap(NULL, length + sizeof(prologue) + sizeof(epilogue),
            PROT_WRITE | PROT_EXEC, MAP_ANON | MAP_PRIVATE, -1, 0);
    uint8_t *stk = mmap(NULL, STACK_SIZE, PROT_WRITE, MAP_ANON | MAP_PRIVATE, -1, 0);
    memcpy(mem, prologue, sizeof(prologue));
    memcpy(mem + sizeof(prologue), bytecode, length);
    memcpy(mem + sizeof(prologue) + length, epilogue, sizeof(epilogue));
    // modify prologue esp save to point to epilogue in executable memory
    write_le32(mem + 0x3, (uint32_t) (mem + sizeof(prologue) + length + 0x30));
    // modify prologue esp mov to point to the "stack"
    write_le32(mem + 0x8, (uint32_t) (stk + STACK_SIZE));

    ((void __cdecl (*)(void)) mem)();

    for (int i = 0; i < 9; ++i) {
        printf("%" PRIX32 " ", outputs[i]);
    }
    putchar('\n');

    for (int i = STACK_SIZE; i -= 4; ) {
        uint32_t tmp = stk[i] | stk[i + 1] << 8 | stk[i + 2] << 16 | stk[i + 3] << 24;
        printf("%" PRIX32 " ", tmp);
    }
    
    munmap(stk, STACK_SIZE);
    munmap(mem, length + sizeof(prologue) + sizeof(epilogue));
    stk = mem = NULL;
}

int main(int argc, char *argv[]) {
    if (argc < 11) { // argv[0] + 8 gen purpose registers + EFLAGS + bytecode
        fprintf(stderr, "%s: too few arguments (min 10, given %d)\n", argv[0],
                argc - 1);
        return 1;
    }

    uint8_t set_eflags[] = {
        /* 00: */ 0x9C,                                      // pushfd
        // only clear CF, PF, AF, ZF, SF, and OF
        /* 01: */ 0x81, 0x24, 0x24, 0x28, 0xF7, 0xFF, 0xFF,  // and dword ptr [esp], 0xFFFFF728
        /* 08: */ 0x81, 0x0C, 0x24, 0x00, 0x00, 0x00, 0x00,  // or dword ptr [esp], ???
        /* 0F: */ 0x9D,                                      // popfd
    };
    // there are argc - 10 bytes of given bytecode
    uint8_t bytecode[(argc - 10) + sizeof(set_eflags)];
    memcpy(bytecode, set_eflags, sizeof(set_eflags));
    size_t offset = sizeof(set_eflags);
    for (int i = 1; i < 10; ++i) {
        uint32_t value;
        int count = sscanf(argv[i], "%" SCNx32, &value);
        if (count != 1 && strcmp(argv[i], "-")) {
            fprintf(stderr, "%s: bad register (format should be a 32-bit integer or "
                    "'-', given %s)\n", argv[0], argv[i]);
            return 2;
        }
        if (count != 1) {
            continue;
        }
        if (i == 1) { // EFLAGS
            write_le32(bytecode + 0xB, value);
        } else {
            bytecode[offset++] = 0xB8 | (i - 2); // mov r32, imm32
            write_le32(bytecode + offset, value);
            offset += 4;
        }
    }
    for (int i = 10; i < argc; ++i) {
        uint8_t value;
        int count = sscanf(argv[i], "%" SCNx8, &value);
        if (count != 1) {
            fprintf(stderr, "%s: bad instruction (format should be a 8-bit integer, "
                    "given %s)\n", argv[0], argv[i]);
            return 3;
        }
        bytecode[offset++] = value;
    }
    run_and_print(bytecode, offset);
    return 0;
}

