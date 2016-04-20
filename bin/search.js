
var program = require('commander')
  , sprintf = require('sprintf')
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
          .then(function() {
            process.exit();
          })
          .catch(function(err) {
            console.log("Error", err);

          })
      });

    program
      .command('add-pages')
      .action(function (cmd, env) {
        var search = crowi.getSearcher();

        search.addAllPages()
          .then(function(data) {
            if (data.errors) {
              console.error(data);
              console.error('Failed to index.');
            } else {
              console.log('Data is successfully indexed.');
            }
            process.exit(0);
          })
          .catch(function(err) {
            console.log("Error", err);
          });
      });

    program
      .command('rebuild-index')
      .action(function (cmd, env) {
        var search = crowi.getSearcher();

        search.deleteIndex()
          .then(function(data) {
            if (!data.errors) {
              console.log('Index deleted.');
            }
            return search.buildIndex();
          })
          .then(function(data) {
            if (!data.errors) {
              console.log('Index created.');
            }
            return search.addAllPages();
          })
          .then(function(data) {
            if (!data.errors) {
              console.log('Data is successfully indexed.');
            }
            process.exit(0);
          })
          .catch(function(err) {
            console.error('Error', err);
          });
      });


    program.parse(process.argv);

  }).catch(crowi.exitOnError);


//program
//  .command('search [query]', 'search with optional query')
//  .command('list', 'list packages installed', {isDefault: true})


