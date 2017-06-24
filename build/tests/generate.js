"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const util_1 = require("util");
const p_exec = util_1.promisify(child_process_1.exec);
const p_readFile = util_1.promisify(fs_1.readFile);
const p_writeFile = util_1.promisify(fs_1.writeFile);
function indent(strs) {
    return strs.map(x => `  ${x}`);
}
function printHex(x) {
    if (x < 0) {
        x += 0x100000000;
    }
    return x.toString(16).toUpperCase();
}
function fstrToInt(fstr) {
    let res = 0;
    if (fstr.indexOf('c') >= 0) {
        res |= (1 << 0);
    }
    if (fstr.indexOf('p') >= 0) {
        res |= (1 << 2);
    }
    if (fstr.indexOf('a') >= 0) {
        res |= (1 << 4);
    }
    if (fstr.indexOf('z') >= 0) {
        res |= (1 << 6);
    }
    if (fstr.indexOf('s') >= 0) {
        res |= (1 << 7);
    }
    if (fstr.indexOf('o') >= 0) {
        res |= (1 << 11);
    }
    return res;
}
function intToFstr(flags) {
    let fstr = '';
    if (flags & (1 << 0)) {
        fstr += 'c';
    }
    if (flags & (1 << 2)) {
        fstr += 'p';
    }
    if (flags & (1 << 4)) {
        fstr += 'a';
    }
    if (flags & (1 << 6)) {
        fstr += 'z';
    }
    if (flags & (1 << 7)) {
        fstr += 's';
    }
    if (flags & (1 << 11)) {
        fstr += 'o';
    }
    return fstr;
}
function prepareRegArgs(regs) {
    let res = '';
    const add = (reg) => {
        if (regs.hasOwnProperty(reg)) {
            res += `${printHex(regs[reg])} `;
        }
        else {
            res += '- ';
        }
    };
    add('eax');
    add('ecx');
    add('edx');
    add('ebx');
    add('esp');
    add('ebp');
    add('esi');
    add('edi');
    return res;
}
function formatText(text) {
    return '[' + text.map(x => `0x${x.toUpperCase()}`).join(', ') + ']';
}
function formatRegs(regs) {
    return '{' + Object.keys(regs).map(reg => `${reg}: 0x${printHex(regs[reg])}`)
        .join(', ') + '}';
}
Promise.resolve((() => __awaiter(this, void 0, void 0, function* () {
    const template = yield p_readFile('../../tests/generate.ts.template', 'utf8');
    yield Promise.all(process.argv.slice(2).map((file) => __awaiter(this, void 0, void 0, function* () {
        const data = yield p_readFile(file, 'utf8');
        const tests = JSON.parse(data);
        const output = [].concat.apply([], yield Promise.all(Object.keys(tests).map((testName) => __awaiter(this, void 0, void 0, function* () {
            const outputs = yield Promise.all(tests[testName].map((test) => __awaiter(this, void 0, void 0, function* () {
                const text = test.text.match(/[\dA-F]{2}/gi);
                const flags = fstrToInt(test.flgs || '');
                const regs = prepareRegArgs(test.regs);
                const { stdout, stderr } = yield p_exec(`./run_bytecode.out ${flags} ${regs} ${text.join(' ')}`);
                if (stderr) {
                    throw new Error(stderr);
                }
                const values = stdout.match(/[\dA-F]+/gi).map(x => parseInt(x, 16));
                const outputRegs = {
                    eax: values[1],
                    ecx: values[2],
                    edx: values[3],
                    ebx: values[4],
                    esi: values[7],
                    edi: values[8],
                };
                const expectedRegs = {};
                (test.outregs || []).forEach(x => { expectedRegs[x] = outputRegs[x]; });
                const expectedFlags = intToFstr(values[0]);
                return `ti(test, ${formatText(text)}, ${formatRegs(test.regs)}, ` +
                    `${formatRegs(expectedRegs)}, '${test.flgs || ''}', ` +
                    `'${expectedFlags}');`;
            })));
            return [`${JSON.stringify(testName)}: function(test: any): void {`]
                .concat(indent(outputs.concat(['test.done();'])))
                .concat(['},']);
        }))));
        const final_output = template.replace('{{tests}}', indent(output).join('\n'));
        const out_filename = file.replace(/\.json$/, '.generated.ts');
        yield p_writeFile(out_filename, final_output);
        console.log(`Wrote to ${out_filename}`);
    })));
}))());
//# sourceMappingURL=generate.js.map