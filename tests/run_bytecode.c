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

void write_le32(uint8_t *out, uint32_t value) {
    *out++ = value & 0xFF;
    *out++ = (value >> 8) & 0xFF;
    *out++ = (value >> 16) & 0xFF;
    *out++ = (value >> 24) & 0xFF;
}

void run_and_print(uint8_t * const bytecode, size_t length) {
    uint8_t epilogue[] = {
        0x9C,                               // pushfd
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x60,                               // pushad
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0x8F, 0x05, 0x00, 0x00, 0x00, 0x00, // pop dword ptr ds:placeholder
        0xC3,                               // ret
    };

    uint32_t outputs[9];
    write_le32(epilogue + 3, (uint32_t) outputs);
    for (int i = 1; i < 9; ++i) {
        write_le32(epilogue + 4 + 6 * i, (uint32_t) (outputs + 9 - i));
    }

    uint8_t *mem = (uint8_t *) mmap(NULL, length + sizeof(epilogue),
            PROT_WRITE | PROT_EXEC, MAP_ANON | MAP_PRIVATE, -1, 0);
    memcpy(mem, bytecode, length);
    memcpy(mem + length, epilogue, sizeof(epilogue));

    ((void __cdecl (*)(void)) mem)();

    munmap(mem, length + sizeof(epilogue));
    mem = NULL;

    for (int i = 0; i < 9; ++i) {
        printf("%" PRIX32 " ", outputs[i]);
    }
    putchar('\n');
}

int main(int argc, char *argv[]) {
    if (argc < 11) { // argv[0] + 8 gen purpose registers + EFLAGS + bytecode
        fprintf(stderr, "%s: too few arguments (min 10, given %d)\n", argv[0],
                argc - 1);
        return 1;
    }

    uint8_t set_eflags[] = {
        0x9C,                                      // pushfd
        // only clear CF, PF, AF, ZF, SF, and OF
        0x81, 0x24, 0x24, 0x28, 0xF7, 0xFF, 0xFF,  // and dword ptr [esp], 0xFFFFF728
        0x81, 0x0C, 0x24, 0x00, 0x00, 0x00, 0x00,  // or dword ptr [esp], PLACEHOLDER
        0x9D,                                      // popfd
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
            write_le32(bytecode + 11, value);
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

