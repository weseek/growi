const { body, param } = require('express-validator/check');

const validator = {};

validator.create = [
  body('name').trim().exists(),
];

validator.delete = [
  param('id').trim().exists(),
  body('actionName').trim().exists(),
  body('transferToUserGroupId').trim(),
];

module.exports = validator;
