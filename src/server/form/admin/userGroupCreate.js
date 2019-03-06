const form = require('express-form');

const field = form.field;

module.exports = form(
  field('createGroupForm[userGroupName]', '新規グループ名').trim().required(),
);
