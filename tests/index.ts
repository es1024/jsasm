import * as Suite from 'testjs';

import test_x86_core from './test_x86_core';
import test_x86_arithmetic from './test_x86_arithmetic.generated';

const tests = {
  'core': test_x86_core,
  'arithmetic': test_x86_arithmetic,
};

Suite.run(tests, 'x86');

