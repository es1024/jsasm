import {X86Flag} from '../src/x86';

import {testInst} from './helpers';

const ti = testInst;
// tests generally use r = reg 0, r/m = reg 1 (0xC1)
const tests = {
  'inst 00 - add r/m8, r8': function(test: any): void {
    const txt = [0x00, 0xC1]; // add cl, al
    ti(test, txt, {eax: 0x66, ecx: 0x55}, {ecx: 0xBB}, '', 'pso');
    ti(test, txt, {eax: 0x30, ecx: 0xFF}, {ecx: 0x2F}, '', 'c');
    ti(test, txt, {eax: 0x82, ecx: 0x81}, {ecx: 0x03}, '', 'cpo');
    ti(test, txt, {eax: 0xD0, ecx: 0x30}, {ecx: 0x00}, '', 'cpz');
    ti(test, txt, {eax: 0x38, ecx: 0x38}, {ecx: 0x70}, '', 'a');
    test.done();
  },
  'inst 01 - add r/m32, r32': function(test: any): void {
    const txt = [0x01, 0xC1]; // add ecx, eax
    ti(test, txt, {eax: 0x20000066, ecx: 0x60000055}, {ecx: 0x800000BB}, '', 'pso');
    ti(test, txt, {eax: 0x30000000, ecx: 0xFFFFFFFE}, {ecx: 0x2FFFFFFE}, '', 'c');
    ti(test, txt, {eax: 0x80000002, ecx: 0x80000001}, {ecx: 0x00000003}, '', 'cpo');
    ti(test, txt, {eax: 0xD0000000, ecx: 0x30000000}, {ecx: 0x00000000}, '', 'cpz');
    ti(test, txt, {eax: 0xC1235138, ecx: 0xAE324F38}, {ecx: 0x6F55A070}, '', 'cao');
    test.done();
  },
  'inst 02 - add r/8, rm8': function(test: any): void {
    const txt = [0x02, 0xC1]; // add al, cl
    ti(test, txt, {eax: 0x55, ecx: 0x66}, {eax: 0xBB}, '', 'pso');
    ti(test, txt, {eax: 0xFF, ecx: 0x30}, {eax: 0x2F}, '', 'c');
    ti(test, txt, {eax: 0x81, ecx: 0x82}, {eax: 0x03}, '', 'cpo');
    ti(test, txt, {eax: 0x30, ecx: 0xD0}, {eax: 0x00}, '', 'cpz');
    ti(test, txt, {eax: 0x38, ecx: 0x38}, {eax: 0x70}, '', 'a');
    test.done();
  },
  'inst 03 - add r32, r/m32': function(test: any): void {
    const txt = [0x03, 0xC1]; // add eax, ecx
    ti(test, txt, {eax: 0x60000055, ecx: 0x20000066}, {eax: 0x800000BB}, '', 'pso');
    ti(test, txt, {eax: 0xFFFFFFFE, ecx: 0x30000000}, {eax: 0x2FFFFFFE}, '', 'c');
    ti(test, txt, {eax: 0x80000001, ecx: 0x80000002}, {eax: 0x00000003}, '', 'cpo');
    ti(test, txt, {eax: 0x30000000, ecx: 0xD0000000}, {eax: 0x00000000}, '', 'cpz');
    ti(test, txt, {eax: 0xAE324F38, ecx: 0xC1235138}, {eax: 0x6F55A070}, '', 'cao');
    test.done();
  },
  'inst 04 - add al, imm8': function(test: any): void {
    ti(test, [0x04, 0x66], {eax: 0x55}, {eax: 0xBB}, '', 'pso');
    ti(test, [0x04, 0x30], {eax: 0xFF}, {eax: 0x2F}, '', 'c');
    ti(test, [0x04, 0x82], {eax: 0x81}, {eax: 0x03}, '', 'cpo');
    ti(test, [0x04, 0xD0], {eax: 0x30}, {eax: 0x00}, '', 'cpz');
    ti(test, [0x04, 0x38], {eax: 0x38}, {eax: 0x70}, '', 'a');
    test.done();
  },
  'inst 05 - add eax, imm32': function(test: any): void {
    ti(test, [0x05, 0x66, 0x00, 0x00, 0x20], {eax: 0x60000055}, {eax: 0x800000BB},
        '', 'pso');
    ti(test, [0x05, 0x00, 0x00, 0x00, 0x30], {eax: 0xFFFFFFFE}, {eax: 0x2FFFFFFE},
        '', 'c');
    ti(test, [0x05, 0x02, 0x00, 0x00, 0x80], {eax: 0x80000001}, {eax: 0x00000003},
        '', 'cpo');
    ti(test, [0x05, 0x00, 0x00, 0x00, 0xD0], {eax: 0x30000000}, {eax: 0x00000000},
        '', 'cpz');
    ti(test, [0x05, 0x38, 0x51, 0x23, 0xC1], {eax: 0xAE324F38}, {eax: 0x6F55A070},
        '', 'cao');
    test.done();
  },
  'inst 28 - sub r/m8, r8': function(test: any): void {
    const txt = [0x28, 0xC1]; // sub cl, al
    ti(test, txt, {eax: 0x33, ecx: 0x66}, {ecx: 0x33}, '', 'p');
    ti(test, txt, {eax: 0xAB, ecx: 0x66}, {ecx: 0xBB}, '', 'cpaso');
    ti(test, txt, {eax: 0xD0, ecx: 0xFF}, {ecx: 0x2F}, '', '');
    ti(test, txt, {eax: 0x7E, ecx: 0x81}, {ecx: 0x03}, '', 'pao');
    ti(test, txt, {eax: 0x30, ecx: 0x30}, {ecx: 0x00}, '', 'pz');
    ti(test, txt, {eax: 0xC8, ecx: 0x38}, {ecx: 0x70}, '', 'c');
    ti(test, txt, {eax: 0x39, ecx: 0xC8}, {ecx: 0x8F}, '', 'as');
    test.done();
  },
  'inst 29 - sub r/m32, r32': function(test: any): void {
    const txt = [0x29, 0xC1]; // sub ecx, eax
    ti(test, txt, {eax: 0x20000033, ecx: 0x60000066}, {ecx: 0x40000033}, '', 'p');
    ti(test, txt, {eax: 0xAB3241AB, ecx: 0x66774711}, {ecx: 0xBB450566}, '', 'cpas');
    ti(test, txt, {eax: 0x999999D0, ecx: 0x999999FF}, {ecx: 0x0000002F}, '', '');
    ti(test, txt, {eax: 0x7000007E, ecx: 0x80000081}, {ecx: 0x10000003}, '', 'pao');
    ti(test, txt, {eax: 0x80000081, ecx: 0x7000007E}, {ecx: 0xEFFFFFFD}, '', 'cso');
    ti(test, txt, {eax: 0x2419E730, ecx: 0x2419E730}, {ecx: 0x00000000}, '', 'pz');
    ti(test, txt, {eax: 0xC0000008, ecx: 0x30000008}, {ecx: 0x70000000}, '', 'cp');
    ti(test, txt, {eax: 0x3000000A, ecx: 0xC0000008}, {ecx: 0x8FFFFFFE}, '', 'as');
    test.done();
  },
  'inst 2A - sub r/8, rm8': function(test: any): void {
    const txt = [0x2A, 0xC1]; // sub al, cl
    ti(test, txt, {eax: 0x66, ecx: 0x33}, {eax: 0x33}, '', 'p');
    ti(test, txt, {eax: 0x66, ecx: 0xAB}, {eax: 0xBB}, '', 'cpaso');
    ti(test, txt, {eax: 0xFF, ecx: 0xD0}, {eax: 0x2F}, '', '');
    ti(test, txt, {eax: 0x81, ecx: 0x7E}, {eax: 0x03}, '', 'pao');
    ti(test, txt, {eax: 0x30, ecx: 0x30}, {eax: 0x00}, '', 'pz');
    ti(test, txt, {eax: 0x38, ecx: 0xC8}, {eax: 0x70}, '', 'c');
    ti(test, txt, {eax: 0xC8, ecx: 0x39}, {eax: 0x8F}, '', 'as');
    test.done();
  },
  'inst 2B - sub r32, r/m32': function(test: any): void {
    const txt = [0x2B, 0xC1]; // sub eax, ecx
    ti(test, txt, {eax: 0x60000066, ecx: 0x20000033}, {eax: 0x40000033}, '', 'p');
    ti(test, txt, {eax: 0x66774711, ecx: 0xAB3241AB}, {eax: 0xBB450566}, '', 'cpas');
    ti(test, txt, {eax: 0x999999FF, ecx: 0x999999D0}, {eax: 0x0000002F}, '', '');
    ti(test, txt, {eax: 0x80000081, ecx: 0x7000007E}, {eax: 0x10000003}, '', 'pao');
    ti(test, txt, {eax: 0x7000007E, ecx: 0x80000081}, {eax: 0xEFFFFFFD}, '', 'cso');
    ti(test, txt, {eax: 0x2419E730, ecx: 0x2419E730}, {eax: 0x00000000}, '', 'pz');
    ti(test, txt, {eax: 0x30000008, ecx: 0xC0000008}, {eax: 0x70000000}, '', 'cp');
    ti(test, txt, {eax: 0xC0000008, ecx: 0x3000000A}, {eax: 0x8FFFFFFE}, '', 'as');
    test.done();
  },
  'inst 2C - sub al, imm8': function(test: any): void {
    ti(test, [0x2C, 0x33], {eax: 0x66}, {eax: 0x33}, '', 'p');
    ti(test, [0x2C, 0xAB], {eax: 0x66}, {eax: 0xBB}, '', 'cpaso');
    ti(test, [0x2C, 0xD0], {eax: 0xFF}, {eax: 0x2F}, '', '');
    ti(test, [0x2C, 0x7E], {eax: 0x81}, {eax: 0x03}, '', 'pao');
    ti(test, [0x2C, 0x30], {eax: 0x30}, {eax: 0x00}, '', 'pz');
    ti(test, [0x2C, 0xC8], {eax: 0x38}, {eax: 0x70}, '', 'c');
    ti(test, [0x2C, 0x39], {eax: 0xC8}, {eax: 0x8F}, '', 'as');
    test.done();
  },
  'inst 2D - sub eax, imm32': function(test: any): void {
    ti(test, [0x2D, 0x33, 0x00, 0x00, 0x20], {eax: 0x60000066}, {eax: 0x40000033},
        '', 'p');
    ti(test, [0x2D, 0xAB, 0x41, 0x32, 0xAB], {eax: 0x66774711}, {eax: 0xBB450566},
        '', 'cpas');
    ti(test, [0x2D, 0xD0, 0x99, 0x99, 0x99], {eax: 0x999999FF}, {eax: 0x0000002F},
        '', '');
    ti(test, [0x2D, 0x7E, 0x00, 0x00, 0x70], {eax: 0x80000081}, {eax: 0x10000003},
        '', 'pao');
    ti(test, [0x2D, 0x81, 0x00, 0x00, 0x80], {eax: 0x7000007E}, {eax: 0xEFFFFFFD},
        '', 'cso');
    ti(test, [0x2D, 0x30, 0xE7, 0x19, 0x24], {eax: 0x2419E730}, {eax: 0x00000000},
        '', 'pz');
    ti(test, [0x2D, 0x08, 0x00, 0x00, 0xC0], {eax: 0x30000008}, {eax: 0x70000000},
        '', 'cp');
    ti(test, [0x2D, 0x0A, 0x00, 0x00, 0x30], {eax: 0xC0000008}, {eax: 0x8FFFFFFE},
        '', 'as');
    test.done();
  },
  'inst 38 - cmp r/m8, r8': function(test: any): void {
    const txt = [0x38, 0xC1]; // cmp cl, al
    ti(test, txt, {eax: 0x33, ecx: 0x66}, {ecx: 0x66}, '', 'p');
    ti(test, txt, {eax: 0xAB, ecx: 0x66}, {ecx: 0x66}, '', 'cpaso');
    ti(test, txt, {eax: 0xD0, ecx: 0xFF}, {ecx: 0xFF}, '', '');
    ti(test, txt, {eax: 0x7E, ecx: 0x81}, {ecx: 0x81}, '', 'pao');
    ti(test, txt, {eax: 0x30, ecx: 0x30}, {ecx: 0x30}, '', 'pz');
    ti(test, txt, {eax: 0xC8, ecx: 0x38}, {ecx: 0x38}, '', 'c');
    ti(test, txt, {eax: 0x39, ecx: 0xC8}, {ecx: 0xC8}, '', 'as');
    test.done();
  },
  'inst 39 - cmp r/m32, r32': function(test: any): void {
    const txt = [0x39, 0xC1]; // cmp ecx, eax
    ti(test, txt, {eax: 0x20000033, ecx: 0x60000066}, {ecx: 0x60000066}, '', 'p');
    ti(test, txt, {eax: 0xAB3241AB, ecx: 0x66774711}, {ecx: 0x66774711}, '', 'cpas');
    ti(test, txt, {eax: 0x999999D0, ecx: 0x999999FF}, {ecx: 0x999999FF}, '', '');
    ti(test, txt, {eax: 0x7000007E, ecx: 0x80000081}, {ecx: 0x80000081}, '', 'pao');
    ti(test, txt, {eax: 0x80000081, ecx: 0x7000007E}, {ecx: 0x7000007E}, '', 'cso');
    ti(test, txt, {eax: 0x2419E730, ecx: 0x2419E730}, {ecx: 0x2419E730}, '', 'pz');
    ti(test, txt, {eax: 0xC0000008, ecx: 0x30000008}, {ecx: 0x30000008}, '', 'cp');
    ti(test, txt, {eax: 0x3000000A, ecx: 0xC0000008}, {ecx: 0xC0000008}, '', 'as');
    test.done();
  },
  'inst 3A - cmp r/8, rm8': function(test: any): void {
    const txt = [0x3A, 0xC1]; // cmp al, cl
    ti(test, txt, {eax: 0x66, ecx: 0x33}, {eax: 0x66}, '', 'p');
    ti(test, txt, {eax: 0x66, ecx: 0xAB}, {eax: 0x66}, '', 'cpaso');
    ti(test, txt, {eax: 0xFF, ecx: 0xD0}, {eax: 0xFF}, '', '');
    ti(test, txt, {eax: 0x81, ecx: 0x7E}, {eax: 0x81}, '', 'pao');
    ti(test, txt, {eax: 0x30, ecx: 0x30}, {eax: 0x30}, '', 'pz');
    ti(test, txt, {eax: 0x38, ecx: 0xC8}, {eax: 0x38}, '', 'c');
    ti(test, txt, {eax: 0xC8, ecx: 0x39}, {eax: 0xC8}, '', 'as');
    test.done();
  },
  'inst 3B - cmp r32, r/m32': function(test: any): void {
    const txt = [0x3B, 0xC1]; // cmp eax, ecx
    ti(test, txt, {eax: 0x60000066, ecx: 0x20000033}, {eax: 0x60000066}, '', 'p');
    ti(test, txt, {eax: 0x66774711, ecx: 0xAB3241AB}, {eax: 0x66774711}, '', 'cpas');
    ti(test, txt, {eax: 0x999999FF, ecx: 0x999999D0}, {eax: 0x999999FF}, '', '');
    ti(test, txt, {eax: 0x80000081, ecx: 0x7000007E}, {eax: 0x80000081}, '', 'pao');
    ti(test, txt, {eax: 0x7000007E, ecx: 0x80000081}, {eax: 0x7000007E}, '', 'cso');
    ti(test, txt, {eax: 0x2419E730, ecx: 0x2419E730}, {eax: 0x2419E730}, '', 'pz');
    ti(test, txt, {eax: 0x30000008, ecx: 0xC0000008}, {eax: 0x30000008}, '', 'cp');
    ti(test, txt, {eax: 0xC0000008, ecx: 0x3000000A}, {eax: 0xC0000008}, '', 'as');
    test.done();
  },
  'inst 3C - cmp al, imm8': function(test: any): void {
    ti(test, [0x3C, 0x33], {eax: 0x66}, {eax: 0x66}, '', 'p');
    ti(test, [0x3C, 0xAB], {eax: 0x66}, {eax: 0x66}, '', 'cpaso');
    ti(test, [0x3C, 0xD0], {eax: 0xFF}, {eax: 0xFF}, '', '');
    ti(test, [0x3C, 0x7E], {eax: 0x81}, {eax: 0x81}, '', 'pao');
    ti(test, [0x3C, 0x30], {eax: 0x30}, {eax: 0x30}, '', 'pz');
    ti(test, [0x3C, 0xC8], {eax: 0x38}, {eax: 0x38}, '', 'c');
    ti(test, [0x3C, 0x39], {eax: 0xC8}, {eax: 0xC8}, '', 'as');
    test.done();
  },
  'inst 3D - cmp eax, imm32': function(test: any): void {
    ti(test, [0x3D, 0x33, 0x00, 0x00, 0x20], {eax: 0x60000066}, {eax: 0x60000066},
        '', 'p');
    ti(test, [0x3D, 0xAB, 0x41, 0x32, 0xAB], {eax: 0x66774711}, {eax: 0x66774711},
        '', 'cpas');
    ti(test, [0x3D, 0xD0, 0x99, 0x99, 0x99], {eax: 0x999999FF}, {eax: 0x999999FF},
        '', '');
    ti(test, [0x3D, 0x7E, 0x00, 0x00, 0x70], {eax: 0x80000081}, {eax: 0x80000081},
        '', 'pao');
    ti(test, [0x3D, 0x81, 0x00, 0x00, 0x80], {eax: 0x7000007E}, {eax: 0x7000007E},
        '', 'cso');
    ti(test, [0x3D, 0x30, 0xE7, 0x19, 0x24], {eax: 0x2419E730}, {eax: 0x2419E730},
        '', 'pz');
    ti(test, [0x3D, 0x08, 0x00, 0x00, 0xC0], {eax: 0x30000008}, {eax: 0x30000008},
        '', 'cp');
    ti(test, [0x3D, 0x0A, 0x00, 0x00, 0x30], {eax: 0xC0000008}, {eax: 0xC0000008},
        '', 'as');
    test.done();
  },
};

export default tests;

