#!/usr/bin/env node

// eslint-disable-next-line no-global-assign
require = require('esm')(module);

(async function() {
  try {
    process.env.SHIPJS = true;
    await require('./cli').cli(process.argv);
  }
  catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}());
