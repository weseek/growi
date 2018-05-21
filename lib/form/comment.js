'use strict';

var form = require('express-form')
  , field = form.field;

module.exports = form(
  field('page_id').trim().required(),
  field('revision_id').trim().required(),
  field('comment').trim().required(),
  field('comment_position').trim().toInt(),
  field('is_markdown').trim().toBooleanStrict()
);
