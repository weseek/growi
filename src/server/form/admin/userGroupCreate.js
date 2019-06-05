const form = require('express-form');

const field = form.field;

module.exports = form(
  field('createGroupForm[userGroupName]', 'Group name').trim().required(),
);
