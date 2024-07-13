import type { Document, Schema } from 'mongoose';

import type { ImportMode } from './import-mode';

export type OverwriteFunction = (value: unknown, ctx: { document: Document, propertyName: string, schema: Schema }) => unknown;
export type OverwriteParams = { [propertyName: string]: OverwriteFunction | unknown }

export type ImportSettings = {
  mode: ImportMode,
  jsonFileName: string,
  overwriteParams: OverwriteParams,
}
