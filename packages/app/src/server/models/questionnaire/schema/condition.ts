import { Schema } from 'mongoose';

import { ICondition } from '~/interfaces/questionnaire/condition';
import { GrowiServiceType } from '~/interfaces/questionnaire/growi-info';
import { UserType } from '~/interfaces/questionnaire/user-info';

const conditionSchema = new Schema<ICondition>({
  user: {
    types: [{ type: String, enum: Object.values(UserType) }],
  },
  growi: {
    types: [{ type: String, enum: Object.values(GrowiServiceType) }],
    versionRegExps: [String],
  },
});

export default conditionSchema;
