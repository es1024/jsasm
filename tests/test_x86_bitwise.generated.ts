/** THIS FILE IS GENERATED WITH generate.ts, DO NOT EDIT **/
/* tslint:disable */
import {X86Flag} from '../src/x86';

import {testInst} from './helpers';

const ti = testInst;
const tests = {
  "inst 08 - or r/m8, r8": function(test: any): void {
    ti(test, [0x08, 0xC1], {eax: 0x00, ecx: 0xF3}, {eax: 0x0, ecx: 0xF3}, '', 'ps');
    ti(test, [0x08, 0xC1], {eax: 0x33, ecx: 0x00}, {eax: 0x33, ecx: 0x33}, '', 'p');
    ti(test, [0x08, 0xC1], {eax: 0x25, ecx: 0xDA}, {eax: 0x25, ecx: 0xFF}, '', 'ps');
    ti(test, [0x08, 0xC1], {eax: 0xE3, ecx: 0x01}, {eax: 0xE3, ecx: 0xE3}, '', 's');
    ti(test, [0x08, 0xC1], {eax: 0x00, ecx: 0x00}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 09 - or r/m32, r32": function(test: any): void {
    ti(test, [0x09, 0xC1], {eax: 0x00000000, ecx: 0xCEF75BF3}, {eax: 0x0, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x09, 0xC1], {eax: 0x3EF75BF3, ecx: 0x00000000}, {eax: 0x3EF75BF3, ecx: 0x3EF75BF3}, '', 'p');
    ti(test, [0x09, 0xC1], {eax: 0x3E80CD25, ecx: 0xC17F32DA}, {eax: 0x3E80CD25, ecx: 0xFFFFFFFF}, '', 'ps');
    ti(test, [0x09, 0xC1], {eax: 0xFFFFFEE3, ecx: 0x00000001}, {eax: 0xFFFFFEE3, ecx: 0xFFFFFEE3}, '', 's');
    ti(test, [0x09, 0xC1], {eax: 0x00000000, ecx: 0x00000000}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 0A - or r8, r/m8": function(test: any): void {
    ti(test, [0x0A, 0xC1], {eax: 0x00, ecx: 0xF3}, {eax: 0xF3, ecx: 0xF3}, '', 'ps');
    ti(test, [0x0A, 0xC1], {eax: 0x33, ecx: 0x00}, {eax: 0x33, ecx: 0x0}, '', 'p');
    ti(test, [0x0A, 0xC1], {eax: 0x25, ecx: 0xDA}, {eax: 0xFF, ecx: 0xDA}, '', 'ps');
    ti(test, [0x0A, 0xC1], {eax: 0xE3, ecx: 0x01}, {eax: 0xE3, ecx: 0x1}, '', 's');
    ti(test, [0x0A, 0xC1], {eax: 0x00, ecx: 0x00}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 0B - or r32, r/m32": function(test: any): void {
    ti(test, [0x0B, 0xC1], {eax: 0x00000000, ecx: 0xCEF75BF3}, {eax: 0xCEF75BF3, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x0B, 0xC1], {eax: 0x3EF75BF3, ecx: 0x00000000}, {eax: 0x3EF75BF3, ecx: 0x0}, '', 'p');
    ti(test, [0x0B, 0xC1], {eax: 0x3E80CD25, ecx: 0xC17F32DA}, {eax: 0xFFFFFFFF, ecx: 0xC17F32DA}, '', 'ps');
    ti(test, [0x0B, 0xC1], {eax: 0xFFFFFEE3, ecx: 0x00000001}, {eax: 0xFFFFFEE3, ecx: 0x1}, '', 's');
    ti(test, [0x0B, 0xC1], {eax: 0x00000000, ecx: 0x00000000}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 0C - or al, imm8": function(test: any): void {
    ti(test, [0x0C, 0xF3], {eax: 0x00}, {eax: 0xF3}, '', 'ps');
    ti(test, [0x0C, 0x00], {eax: 0x33}, {eax: 0x33}, '', 'p');
    ti(test, [0x0C, 0xDA], {eax: 0x25}, {eax: 0xFF}, '', 'ps');
    ti(test, [0x0C, 0x01], {eax: 0xE3}, {eax: 0xE3}, '', 's');
    ti(test, [0x0C, 0x00], {eax: 0x00}, {eax: 0x0}, '', 'pz');
    test.done();
  },
  "inst 0D - or eax, imm32": function(test: any): void {
    ti(test, [0x0D, 0xF3, 0x5B, 0xF7, 0xCE], {eax: 0x00000000}, {eax: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x0D, 0x00, 0x00, 0x00, 0x00], {eax: 0x3EF75BF3}, {eax: 0x3EF75BF3}, '', 'p');
    ti(test, [0x0D, 0xDA, 0x32, 0x7F, 0xC1], {eax: 0x3E80CD25}, {eax: 0xFFFFFFFF}, '', 'ps');
    ti(test, [0x0D, 0x01, 0x00, 0x00, 0x00], {eax: 0xFFFFFEE3}, {eax: 0xFFFFFEE3}, '', 's');
    ti(test, [0x0D, 0x00, 0x00, 0x00, 0x00], {eax: 0x00000000}, {eax: 0x0}, '', 'pz');
    test.done();
  },
  "inst 20 - and r/m8, r8": function(test: any): void {
    ti(test, [0x20, 0xC1], {eax: 0xFF, ecx: 0xF3}, {eax: 0xFF, ecx: 0xF3}, '', 'ps');
    ti(test, [0x20, 0xC1], {eax: 0x33, ecx: 0xFF}, {eax: 0x33, ecx: 0x33}, '', 'p');
    ti(test, [0x20, 0xC1], {eax: 0x25, ecx: 0xDA}, {eax: 0x25, ecx: 0x0}, '', 'pz');
    ti(test, [0x20, 0xC1], {eax: 0xE3, ecx: 0xF3}, {eax: 0xE3, ecx: 0xE3}, '', 's');
    ti(test, [0x20, 0xC1], {eax: 0x00, ecx: 0xBE}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 21 - and r/m32, r32": function(test: any): void {
    ti(test, [0x21, 0xC1], {eax: 0xFFFFFFFF, ecx: 0xCEF75BF3}, {eax: 0xFFFFFFFF, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x21, 0xC1], {eax: 0x3EF75BF3, ecx: 0xFFFFFFFF}, {eax: 0x3EF75BF3, ecx: 0x3EF75BF3}, '', 'p');
    ti(test, [0x21, 0xC1], {eax: 0x3E80CD25, ecx: 0xC17F32DA}, {eax: 0x3E80CD25, ecx: 0x0}, '', 'pz');
    ti(test, [0x21, 0xC1], {eax: 0xFFFFFFE3, ecx: 0xFFFFFFF3}, {eax: 0xFFFFFFE3, ecx: 0xFFFFFFE3}, '', 's');
    ti(test, [0x21, 0xC1], {eax: 0x00000000, ecx: 0x7A8209BE}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 22 - and r8, r/m8": function(test: any): void {
    ti(test, [0x22, 0xC1], {eax: 0xFF, ecx: 0xF3}, {eax: 0xF3, ecx: 0xF3}, '', 'ps');
    ti(test, [0x22, 0xC1], {eax: 0x33, ecx: 0xFF}, {eax: 0x33, ecx: 0xFF}, '', 'p');
    ti(test, [0x22, 0xC1], {eax: 0x25, ecx: 0xDA}, {eax: 0x0, ecx: 0xDA}, '', 'pz');
    ti(test, [0x22, 0xC1], {eax: 0xE3, ecx: 0xF3}, {eax: 0xE3, ecx: 0xF3}, '', 's');
    ti(test, [0x22, 0xC1], {eax: 0x00, ecx: 0xBE}, {eax: 0x0, ecx: 0xBE}, '', 'pz');
    test.done();
  },
  "inst 23 - and r32, r/m32": function(test: any): void {
    ti(test, [0x23, 0xC1], {eax: 0xFFFFFFFF, ecx: 0xCEF75BF3}, {eax: 0xCEF75BF3, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x23, 0xC1], {eax: 0x3EF75BF3, ecx: 0xFFFFFFFF}, {eax: 0x3EF75BF3, ecx: 0xFFFFFFFF}, '', 'p');
    ti(test, [0x23, 0xC1], {eax: 0x3E80CD25, ecx: 0xC17F32DA}, {eax: 0x0, ecx: 0xC17F32DA}, '', 'pz');
    ti(test, [0x23, 0xC1], {eax: 0xFFFFFFE3, ecx: 0xFFFFFFF3}, {eax: 0xFFFFFFE3, ecx: 0xFFFFFFF3}, '', 's');
    ti(test, [0x23, 0xC1], {eax: 0x00000000, ecx: 0x7A8209BE}, {eax: 0x0, ecx: 0x7A8209BE}, '', 'pz');
    test.done();
  },
  "inst 24 - and al, imm8": function(test: any): void {
    ti(test, [0x24, 0xF3], {eax: 0xFF}, {eax: 0xF3}, '', 'ps');
    ti(test, [0x24, 0xFF], {eax: 0x33}, {eax: 0x33}, '', 'p');
    ti(test, [0x24, 0xDA], {eax: 0x25}, {eax: 0x0}, '', 'pz');
    ti(test, [0x24, 0xF3], {eax: 0xE3}, {eax: 0xE3}, '', 's');
    ti(test, [0x24, 0xBE], {eax: 0x00}, {eax: 0x0}, '', 'pz');
    test.done();
  },
  "inst 25 - and eax, imm32": function(test: any): void {
    ti(test, [0x25, 0xF3, 0x5B, 0xF7, 0xCE], {eax: 0xFFFFFFFF}, {eax: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x25, 0xFF, 0xFF, 0xFF, 0xFF], {eax: 0x3EF75BF3}, {eax: 0x3EF75BF3}, '', 'p');
    ti(test, [0x25, 0xDA, 0x32, 0x7F, 0xC1], {eax: 0x3E80CD25}, {eax: 0x0}, '', 'pz');
    ti(test, [0x25, 0xF3, 0xFF, 0xFF, 0xFF], {eax: 0xFFFFFFE3}, {eax: 0xFFFFFFE3}, '', 's');
    ti(test, [0x25, 0xBE, 0x09, 0x82, 0x7A], {eax: 0x00000000}, {eax: 0x0}, '', 'pz');
    test.done();
  },
  "inst 30 - xor r/m8, r8": function(test: any): void {
    ti(test, [0x30, 0xC1], {eax: 0x00, ecx: 0xF3}, {eax: 0x0, ecx: 0xF3}, '', 'ps');
    ti(test, [0x30, 0xC1], {eax: 0xF4, ecx: 0xFF}, {eax: 0xF4, ecx: 0xB}, '', '');
    ti(test, [0x30, 0xC1], {eax: 0x24, ecx: 0xDA}, {eax: 0x24, ecx: 0xFE}, '', 's');
    ti(test, [0x30, 0xC1], {eax: 0x43, ecx: 0x01}, {eax: 0x43, ecx: 0x42}, '', 'p');
    ti(test, [0x30, 0xC1], {eax: 0x00, ecx: 0x00}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    ti(test, [0x30, 0xC1], {eax: 0xFF, ecx: 0x00}, {eax: 0xFF, ecx: 0xFF}, '', 'ps');
    ti(test, [0x30, 0xC1], {eax: 0xFF, ecx: 0xFF}, {eax: 0xFF, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 31 - xor r/m32, r32": function(test: any): void {
    ti(test, [0x31, 0xC1], {eax: 0x00000000, ecx: 0xCEF75BF3}, {eax: 0x0, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x31, 0xC1], {eax: 0xCEF75BF4, ecx: 0xFFFFFFFF}, {eax: 0xCEF75BF4, ecx: 0x3108A40B}, '', '');
    ti(test, [0x31, 0xC1], {eax: 0x3E80CD24, ecx: 0xC17F32DA}, {eax: 0x3E80CD24, ecx: 0xFFFFFFFE}, '', 's');
    ti(test, [0x31, 0xC1], {eax: 0x4FFFFE43, ecx: 0x00000001}, {eax: 0x4FFFFE43, ecx: 0x4FFFFE42}, '', 'p');
    ti(test, [0x31, 0xC1], {eax: 0x00000000, ecx: 0x00000000}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    ti(test, [0x31, 0xC1], {eax: 0xFFFFFFFF, ecx: 0x00000000}, {eax: 0xFFFFFFFF, ecx: 0xFFFFFFFF}, '', 'ps');
    ti(test, [0x31, 0xC1], {eax: 0xFFFFFFFF, ecx: 0xFFFFFFFF}, {eax: 0xFFFFFFFF, ecx: 0x0}, '', 'pz');
    test.done();
  },
  "inst 32 - xor r8, r/m8": function(test: any): void {
    ti(test, [0x32, 0xC1], {eax: 0x00, ecx: 0xF3}, {eax: 0xF3, ecx: 0xF3}, '', 'ps');
    ti(test, [0x32, 0xC1], {eax: 0xF4, ecx: 0xFF}, {eax: 0xB, ecx: 0xFF}, '', '');
    ti(test, [0x32, 0xC1], {eax: 0x24, ecx: 0xDA}, {eax: 0xFE, ecx: 0xDA}, '', 's');
    ti(test, [0x32, 0xC1], {eax: 0x43, ecx: 0x01}, {eax: 0x42, ecx: 0x1}, '', 'p');
    ti(test, [0x32, 0xC1], {eax: 0x00, ecx: 0x00}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    ti(test, [0x32, 0xC1], {eax: 0xFF, ecx: 0x00}, {eax: 0xFF, ecx: 0x0}, '', 'ps');
    ti(test, [0x32, 0xC1], {eax: 0xFF, ecx: 0xFF}, {eax: 0x0, ecx: 0xFF}, '', 'pz');
    test.done();
  },
  "inst 33 - xor r32, r/m32": function(test: any): void {
    ti(test, [0x33, 0xC1], {eax: 0x00000000, ecx: 0xCEF75BF3}, {eax: 0xCEF75BF3, ecx: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x33, 0xC1], {eax: 0xCEF75BF4, ecx: 0xFFFFFFFF}, {eax: 0x3108A40B, ecx: 0xFFFFFFFF}, '', '');
    ti(test, [0x33, 0xC1], {eax: 0x3E80CD24, ecx: 0xC17F32DA}, {eax: 0xFFFFFFFE, ecx: 0xC17F32DA}, '', 's');
    ti(test, [0x33, 0xC1], {eax: 0x4FFFFE43, ecx: 0x00000001}, {eax: 0x4FFFFE42, ecx: 0x1}, '', 'p');
    ti(test, [0x33, 0xC1], {eax: 0x00000000, ecx: 0x00000000}, {eax: 0x0, ecx: 0x0}, '', 'pz');
    ti(test, [0x33, 0xC1], {eax: 0xFFFFFFFF, ecx: 0x00000000}, {eax: 0xFFFFFFFF, ecx: 0x0}, '', 'ps');
    ti(test, [0x33, 0xC1], {eax: 0xFFFFFFFF, ecx: 0xFFFFFFFF}, {eax: 0x0, ecx: 0xFFFFFFFF}, '', 'pz');
    test.done();
  },
  "inst 34 - xor al, imm8": function(test: any): void {
    ti(test, [0x34, 0xF3], {eax: 0x00}, {eax: 0xF3}, '', 'ps');
    ti(test, [0x34, 0xFF], {eax: 0xF4}, {eax: 0xB}, '', '');
    ti(test, [0x34, 0xDA], {eax: 0x24}, {eax: 0xFE}, '', 's');
    ti(test, [0x34, 0x01], {eax: 0x43}, {eax: 0x42}, '', 'p');
    ti(test, [0x34, 0x00], {eax: 0x00}, {eax: 0x0}, '', 'pz');
    ti(test, [0x34, 0x00], {eax: 0xFF}, {eax: 0xFF}, '', 'ps');
    ti(test, [0x34, 0xFF], {eax: 0xFF}, {eax: 0x0}, '', 'pz');
    test.done();
  },
  "inst 35 - xor r32, r/m32": function(test: any): void {
    ti(test, [0x35, 0xF3, 0x5B, 0xF7, 0xCE], {eax: 0x00000000}, {eax: 0xCEF75BF3}, '', 'ps');
    ti(test, [0x35, 0xFF, 0xFF, 0xFF, 0xFF], {eax: 0xCEF75BF4}, {eax: 0x3108A40B}, '', '');
    ti(test, [0x35, 0xDA, 0x32, 0x7F, 0xC1], {eax: 0x3E80CD24}, {eax: 0xFFFFFFFE}, '', 's');
    ti(test, [0x35, 0x01, 0x00, 0x00, 0x00], {eax: 0x4FFFFE43}, {eax: 0x4FFFFE42}, '', 'p');
    ti(test, [0x35, 0x00, 0x00, 0x00, 0x00], {eax: 0x00000000}, {eax: 0x0}, '', 'pz');
    ti(test, [0x35, 0x00, 0x00, 0x00, 0x00], {eax: 0xFFFFFFFF}, {eax: 0xFFFFFFFF}, '', 'ps');
    ti(test, [0x35, 0xFF, 0xFF, 0xFF, 0xFF], {eax: 0xFFFFFFFF}, {eax: 0x0}, '', 'pz');
    test.done();
  },
};

export default tests;

