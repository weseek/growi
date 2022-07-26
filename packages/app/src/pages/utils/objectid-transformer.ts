// !!! Do NOT import 'mongoose' to reduce bundle size !!!
import ObjectId from 'bson-objectid';
import superjson from 'superjson';

export const registerTransformerForObjectId = (): void => {
  superjson.registerCustom<ObjectId|string, string>(
    {
      isApplicable: (v): v is ObjectId => {
        if (typeof v === 'string') {
          return ObjectId.isValid(v);
        }
        if (typeof v.toHexString === 'function') {
          return ObjectId.isValid(v.toHexString());
        }
        return false;
      },
      serialize: v => (typeof v === 'string' ? v : v.toHexString()),
      deserialize: v => v,
    },
    'ObjectidTransformer',
  );
};
