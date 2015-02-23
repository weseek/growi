'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('pageForm.body').required()
  //field('pageForm.hoge').required()
);
