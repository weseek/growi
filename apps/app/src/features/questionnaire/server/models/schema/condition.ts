import { GrowiServiceType } from '@growi/core/dist/consts';
import { Schema } from 'mongoose';

import type { ICondition } from '../../../interfaces/condition';
import { UserType } from '../../../interfaces/user-info';

const conditionSchema = new Schema<ICondition>({
  user: {
    types: [{ type: String, enum: Object.values(UserType) }],
    daysSinceCreation: {
      moreThanOrEqualTo: { type: Number, min: 0 },
      lessThanOrEqualTo: {
        type: Number,
        min: 0,
        validate: [
          function (value) {
            return this.user.daysSinceCreation.moreThanOrEqualTo == null || this.user.daysSinceCreation.moreThanOrEqualTo <= value;
          },
          'daysSinceCreation.lessThanOrEqualTo must be greater than moreThanOrEqualTo',
        ],
      },
    },
  },
  growi: {
    types: [{ type: String, enum: Object.values(GrowiServiceType) }],
    versionRegExps: [String],
  },
});

export default conditionSchema;
