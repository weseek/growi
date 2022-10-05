export class DatabaseContext {

  pagePath: string;

  options?: Record<string, string|undefined>;

  /**
   * for printing errors
   * @returns
   */
  toString(): string {
    return '$database(とろろ)';
  }

}
