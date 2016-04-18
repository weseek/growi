
var program = require('commander')
  , debug = require('debug')('debug:console:search-util')
  , crowi = new (require('../lib/crowi'))(__dirname, process.env)
  ;

crowi.init()
  .then(function(app) {
    var search = require('../lib/util/search')(crowi);

    program
      .version(crowi.version);

    program
      .command('create-index [name]')
      .action(function (cmd, env) {

        search.buildIndex()
          .then(function(data) {
            console.log(data);
          })
          .catch(function(err) {
            console.log("Error", err);
          });
      });

    program
      .command('rebuild-index [name]')
      .action(function (cmd, env) {

        search.rebuildIndex()
          .then(function(data) {
            console.log('rebuildIndex:', data);
            search.addAllPages();
          })
          .catch(function(err) {
            debug('Error', err);
          });
      });

    program.parse(process.argv);
  }).catch(crowi.exitOnError);


//program
//  .command('search [query]', 'search with optional query')
//  .command('list', 'list packages installed', {isDefault: true})


/*
crowi.init()
  .then(function(app) {
    var search = require('./lib/util/search')(crowi);

    search.buildIndex()
      .then(function(data) {
        console.log(data);
      })
      .catch(function(err) {
        console.log("Error", err);
      });
  }).catch(crowi.exitOnError);

cli.parse({
    seed:      [false, 'Password seed', 'string', ''],
    password:  [false, 'Password raw string', 'string'],
});

cli.main(function(args, options)
{
  console.log("args", args);
  console.log("options", options);

  this.output();
});
*/
