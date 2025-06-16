export declare class MarkdownTable {
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  static fromHTMLTableTag(str: any): MarkdownTable;

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  static fromDSV(str: any, delimiter: any): MarkdownTable;

  static fromMarkdownString(str: string): MarkdownTable;

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  constructor(table: any, options: any);

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  table: any;

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  options: any;

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  toString(): any;

  clone(): MarkdownTable;

  normalizeCells(): MarkdownTable;
}
