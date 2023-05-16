

import {
  each, get, merge, isFunction,
} from 'lodash';
import { Schema } from 'mongoose';

interface PluginOptions {
  type?: 'unique';
  message?: string;
}

type IndexOptions = {
  _id?: number;
  unique?: boolean;
  uniqueCaseInsensitive?: boolean
  partialFilterExpression?: any
}

const deepPath = (schema: Schema, pathName: string): string => {
  let path;
  const paths = pathName.split('.');
  let currentPathName: string | undefined = pathName;
  if (paths.length > 1) {
    currentPathName = paths.shift();
  }

  if (isFunction(schema.path) && currentPathName != null) {
    path = schema.path(currentPathName);
  }

  if (path && path.schema) {
    path = deepPath(path.schema, paths.join('.'));
  }

  return path;
};

const defaultOptions = {
  type: 'unique',
  message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
};

// schema.indexes() error when schema type is Schema
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const uniqueValidator = function(schema: any, options: PluginOptions = {}): void {
  const type = options.type || defaultOptions.type;
  const message = options.message || defaultOptions.message;

  // Mongoose Schema objects don't describe default _id indexes
  // https://github.com/Automattic/mongoose/issues/5998
  const indexes = [[{ _id: 1 }, { unique: true }]].concat(schema.indexes());

  // Dynamically iterate all indexes
  each(indexes, (index) => {
    const indexOptions: IndexOptions = index[1];

    if (indexOptions.unique) {
      const paths = Object.keys(index[0]);
      each(paths, (pathName) => {
        // Choose error message
        const pathMessage = typeof indexOptions.unique === 'string' ? indexOptions.unique : message;

        // Obtain the correct path object
        const path = deepPath(schema, pathName) || schema.path(pathName);

        if (path) {
          // Add an async validator
          path.validate(function() {
            return new Promise((resolve, reject) => {
              const isQuery = this.constructor.name === 'Query';
              const conditions: { [key: string]: any } = {};
              let model;

              if (isQuery) {
                // If the doc is a query, this is a findAndUpdate.
                each(paths, (name) => {
                  let pathValue = get(this, `_update.${name}`) || get(this, `_update.$set.${name}`);

                  // Wrap with case-insensitivity
                  if (get(path, 'options.uniqueCaseInsensitive') || indexOptions.uniqueCaseInsensitive) {
                    // Escape RegExp chars
                    // Keep original regex mongoose-unique-validator
                    // eslint-disable-next-line no-useless-escape
                    pathValue = pathValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                    pathValue = new RegExp(`^${pathValue}$`, 'i');
                  }

                  conditions[name] = pathValue;
                });

                // Use conditions the user has with find*AndUpdate
                each(this._conditions, (value, key) => {
                  conditions[key] = { $ne: value };
                });

                model = this.model;
              }
              else {
                const parentDoc = this.$parent();
                const isNew = parentDoc.isNew;

                if (!isNew && !parentDoc.isModified(pathName)) {
                  return resolve(true);
                }

                // https://mongoosejs.com/docs/subdocs.html#subdocuments-versus-nested-paths
                const isSubdocument = this._id !== parentDoc._id;
                const isNestedPath = isSubdocument ? false : pathName.split('.').length > 1;

                each(paths, (name) => {
                  let pathValue;
                  if (isSubdocument) {
                    const lastKey = name.split('.').pop();
                    if (lastKey) {
                      pathValue = get(this, lastKey);
                    }
                  }
                  else if (isNestedPath) {
                    const keys = name.split('.');
                    pathValue = get(this, keys[0]);
                    for (let i = 1; i < keys.length; i++) {
                      const key = keys[i];
                      pathValue = get(pathValue, key);
                    }
                  }
                  else {
                    pathValue = get(this, name);
                  }

                  // Wrap with case-insensitivity
                  if (get(path, 'options.uniqueCaseInsensitive') || indexOptions.uniqueCaseInsensitive) {
                    // Escape RegExp chars
                    // Keep original regex mongoose-unique-validator
                    // eslint-disable-next-line no-useless-escape
                    pathValue = pathValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                    pathValue = new RegExp(`^${pathValue}$`, 'i');
                  }

                  conditions[name] = pathValue;
                });

                if (!isNew && this._id) {
                  conditions._id = { $ne: this._id };
                }

                // Obtain the model depending on context
                // https://github.com/Automattic/mongoose/issues/3430
                // https://github.com/Automattic/mongoose/issues/3589
                if (isSubdocument) {
                  model = this.ownerDocument().model(this.ownerDocument().constructor.modelName);
                }
                else if (isFunction(this.model)) {
                  model = this.model(this.constructor.modelName);
                }
                else {
                  model = this.constructor.model(this.constructor.modelName);
                }
              }

              if (indexOptions.partialFilterExpression) {
                merge(conditions, indexOptions.partialFilterExpression);
              }

              // Is this model a discriminator and the unique index is on the whole collection,
              // not just the instances of the discriminator? If so, use the base model to query.
              // https://github.com/Automattic/mongoose/issues/4965
              // eslint-disable-next-line
              if (model.baseModelName && (indexOptions.partialFilterExpression === null || indexOptions.partialFilterExpression === undefined)) {
                model = model.db.model(model.baseModelName);
              }

              model.find(conditions).countDocuments()
                .then((count) => {
                  resolve(count === 0);
                })
                .catch((err) => {
                  reject(err);
                });
            });
          }, pathMessage, type);
        }
      });
    }
  });
};

// Export the mongoose plugin
export default uniqueValidator;
