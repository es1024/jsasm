export default class SIGBASE extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, SIGBASE.prototype);
  }
}

