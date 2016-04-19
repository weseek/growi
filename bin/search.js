
var program = require('commander')
  , debug = require('debug')('debug:console:search-util')
  , crowi = new (require('../lib/crowi'))(__dirname + '/../', process.env)
  ;

crowi.init()
  .then(function(app) {
    program
      .version(crowi.version);

    program
      .command('create-index')
      .action(function (cmd, env) {
        var search = crowi.getSearcher();

        search.buildIndex()
          .then(function(data) {
            console.log(data);
          })
          .catch(function(err) {
            console.log("Error", err);
          });
      });

    program
      .command('add-pages')
      .action(function (cmd, env) {
        var search = crowi.getSearcher();

        search.addAllPages()
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


