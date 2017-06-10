import * as Suite from 'testjs';

import test_x86_core from './test_x86_core';

const tests = {
  'core': test_x86_core,
};

Suite.run(tests, 'x86');

