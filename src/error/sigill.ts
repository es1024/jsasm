import SIGBASE from './sigbase';

export default class SIGILL extends SIGBASE {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, SIGILL.prototype);
  }
}


