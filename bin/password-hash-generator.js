var crypto = require('crypto')
  , cli = require('cli')
  ;

function generatePassword (seed, password) {
  var hasher = crypto.createHash('sha256');
  hasher.update(seed + password);

  cli.debug("seed is: " + seed);
  cli.debug("password is: " + password);
  return hasher.digest('hex');
}

cli.parse({
    seed:      [false, 'Password seed', 'string', ''],
    password:  [false, 'Password raw string', 'string'],
});

cli.main(function(args, options)
{
  console.log("args", args);
  console.log("options", options);

  this.output(generatePassword(options.seed, options.password) + '\n');
});
