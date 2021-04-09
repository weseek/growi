export class InvalidGrowiCommandError extends Error {

  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

}
