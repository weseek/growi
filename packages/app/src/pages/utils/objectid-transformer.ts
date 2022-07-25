import { Types as MongooseTypes } from 'mongoose';
import superjson from 'superjson';

export const registerTransformerForObjectId = (): void => {
  superjson.registerCustom<MongooseTypes.ObjectId|string, string>(
    {
      isApplicable: (v): v is MongooseTypes.ObjectId => v instanceof MongooseTypes.ObjectId,
      serialize: v => (v instanceof MongooseTypes.ObjectId ? v.toHexString() : v),
      deserialize: v => v,
    },
    'ObjectidTransformer',
  );
};
