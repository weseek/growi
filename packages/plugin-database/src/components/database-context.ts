export class DatabaseContext {

  databasePath: string;

  options?: Record<string, string|undefined>;

  constructor(databasePath: string, options: Record<string, string|undefined>) {
    this.databasePath = databasePath;

    console.log('databasePath');
    console.log(databasePath);
    console.log('options');
    console.log(options);
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
