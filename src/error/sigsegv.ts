import SIGBASE from './sigbase';

export default class SIGSEGV extends SIGBASE {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, SIGSEGV.prototype);
  }
}

