import { parseISO } from 'date-fns/parseISO';
import isIsoDate from 'is-iso-date';
import { Types, type Document, type Schema } from 'mongoose';

const { ObjectId } = Types;

export type OverwriteFunction = (value: unknown, ctx: { document: Document, propertyName: string, schema?: Schema }) => unknown;

/**
 * keep original value
 * automatically convert ObjectId
 *
 * @param value value from imported document
 * @param ctx context object
 * @return new value for the document
 *
 * @see https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-cast
 */
export const keepOriginal: OverwriteFunction = (value, { document, schema, propertyName }) => {
  // Model
  if (schema != null && schema.path(propertyName) != null) {
    const schemaType = schema.path(propertyName);
    return schemaType.cast(value, document, true);
  }

  // _id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (propertyName === '_id' && ObjectId.isValid(value as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new ObjectId(value as any);
  }

  // Date
  if (isIsoDate(value)) {
    return parseISO(value as string);
  }

  return value;
};
