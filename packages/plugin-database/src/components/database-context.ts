export class DatabaseContext {

  path: string;

  options?: Record<string, string|undefined>;

  constructor(path: string, options: Record<string, string|undefined>) {
    this.path = path;

    // remove undefined keys
    Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);

    this.options = options;
  }

  getStringifiedAttributes(separator = ', '): string {
    const attributeStrs = [`path=${this.path}`];
    if (this.options != null) {
      const optionEntries = Object.entries(this.options).sort();
      attributeStrs.push(
        ...optionEntries.map(([key, val]) => `${key}=${val || 'true'}`),
      );
    }

    return attributeStrs.join(separator);
  }

  /**
   * for printing errors
   * @returns
   */
  toString(): string {
    return `$database(${this.getStringifiedAttributes()})`;
  }

}
