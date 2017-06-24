import {exec} from 'child_process';
import {readFile, writeFile} from 'fs';
import {promisify} from 'util';

import {X86Flag} from '../src/x86';

const p_exec = promisify(exec);
const p_readFile = promisify(readFile);
const p_writeFile = promisify(writeFile);

interface TestSpec {
  text: string;
  regs?: {[reg: string]: number};
  flgs?: string;
  outregs?: string[];
}

function indent(strs: string[]): string[] {
  return strs.map(x => `  ${x}`);
}

function printHex(x: number): string {
  if (x < 0) {
    x += 0x100000000;
  }
  return x.toString(16).toUpperCase();
}

function fstrToInt(fstr: string): number {
  let res = 0;
  if (fstr.indexOf('c') >= 0) {
    res |= (1 << X86Flag.CF);
  }
  if (fstr.indexOf('p') >= 0) {
    res |= (1 << X86Flag.PF);
  }
  if (fstr.indexOf('a') >= 0) {
    res |= (1 << X86Flag.AF);
  }
  if (fstr.indexOf('z') >= 0) {
    res |= (1 << X86Flag.ZF);
  }
  if (fstr.indexOf('s') >= 0) {
    res |= (1 << X86Flag.SF);
  }
  if (fstr.indexOf('o') >= 0) {
    res |= (1 << X86Flag.OF);
  }
  return res;
}

function intToFstr(flags: number): string {
  let fstr = '';
  if (flags & (1 << X86Flag.CF)) {
    fstr += 'c';
  }
  if (flags & (1 << X86Flag.PF)) {
    fstr += 'p';
  }
  if (flags & (1 << X86Flag.AF)) {
    fstr += 'a';
  }
  if (flags & (1 << X86Flag.ZF)) {
    fstr += 'z';
  }
  if (flags & (1 << X86Flag.SF)) {
    fstr += 's';
  }
  if (flags & (1 << X86Flag.OF)) {
    fstr += 'o';
  }
  return fstr;
}

function prepareRegArgs(regs: {[reg: string]: number}): string {
  let res = '';
  const add = (reg: string): void => {
    if (regs.hasOwnProperty(reg)) {
      res += `${printHex(regs[reg])} `;
    } else {
      res += '- ';
    }
  };
  add('eax'); add('ecx'); add('edx'); add('ebx');
  add('esp'); add('ebp'); add('esi'); add('edi');
  return res;
}

function formatText(text: string[]): string {
  return '[' + text.map(x => `0x${x.toUpperCase()}`).join(', ') + ']';
}

function formatRegs(regs: {[reg: string]: number}): string {
  return '{' + Object.keys(regs).map(reg => `${reg}: 0x${printHex(regs[reg])}`)
      .join(', ') + '}';
}

Promise.resolve((async () => {
  const template = await p_readFile('../../tests/generate.ts.template', 'utf8');
  await Promise.all(process.argv.slice(2).map(
      async (file: string): Promise<void> => {
    const data = await p_readFile(file, 'utf8');
    const tests = JSON.parse(data);
    const output = [].concat.apply([], await Promise.all(Object.keys(tests).map(
        async (testName: string): Promise<string[]> => {
      const outputs = await Promise.all(<Promise<string> []> tests[testName].map(
          async (test: TestSpec): Promise<string> => {
        const text = test.text.match(/[\dA-F]{2}/gi);
        const flags = fstrToInt(test.flgs || '');
        const regs = prepareRegArgs(test.regs);
        const {stdout, stderr} = await p_exec(
            `./run_bytecode.out ${flags} ${regs} ${text.join(' ')}`);
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
      }));
      return [`${JSON.stringify(testName)}: function(test: any): void {`]
          .concat(indent(outputs.concat(['test.done();'])))
          .concat(['},']);
    })));
    const final_output = template.replace('{{tests}}', indent(output).join('\n'));
    const out_filename = file.replace(/\.json$/, '.generated.ts');
    await p_writeFile(out_filename, final_output);
    console.log(`Wrote to ${out_filename}`);
  }));
})());
