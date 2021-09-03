#!/usr/bin/env node

require = require('esm')(module);
(async function() {
  try {
    process.env.SHIPJS = true;
    await require('./cli').cli(process.argv);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
