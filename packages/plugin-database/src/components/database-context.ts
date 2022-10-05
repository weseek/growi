export class DatabaseContext {

  path: string;

  options?: Record<string, string|undefined>;

  constructor(path: string, options: Record<string, string|undefined>) {
    this.path = path;

    // remove undefined keys
    Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);

    this.options = options;
  }

  /**
   * for printing errors
   * @returns
   */
  toString(): string {
    return '$database(とろろ)';
  }

}
