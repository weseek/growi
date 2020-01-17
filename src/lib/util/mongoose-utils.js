const mongoose = require('mongoose');

const getModelSafely = (modelName) => {
  if (mongoose.modelNames().includes(modelName)) {
    return mongoose.model(modelName);
  }
  return null;
};

module.exports = {
  getModelSafely,
};
