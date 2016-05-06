
var program = require('commander')
  , sprintf = require('sprintf')
  , debug = require('debug')('crowi:console:search-util')
  , colors = require('colors')
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
              console.error(colors.red.underline('Failed to index all pages.'));
              console.error("");
              data.items.forEach(function(item, i) {
                var index = item.index || null;
                if (index && index.status != 200) {
                  console.error(colors.red('Error item: id=%s'), index._id)
                  console.error('error.type=%s, error.reason=%s', index.error.type, index.error.reason);
                  console.error(index.error.caused_by);
                }
                //debug('Item', i, item);
              });
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

    program
      .command('search')
      .action(function (cmd, env) {
        var Page = crowi.model('Page');
        var search = crowi.getSearcher();
        var keyword = cmd;

        search.searchKeyword(keyword, {})
          .then(function(data) {
            debug('result is', data);
            console.log(colors.green('Search result: %d of %d total. (%d ms)'), data.meta.results, data.meta.total, data.meta.took);

            return Page.populatePageListToAnyObjects(data.data);
          }).then(function(pages) {
            pages.map(function(page) {
              console.log(page._score, page._id, page.path);
            });

            process.exit(0);
          })
          .catch(function(err) {
            console.error('Error', err);

            process.exit(0);
          });
      });


    program.parse(process.argv);

  }).catch(crowi.exitOnError);


//program
//  .command('search [query]', 'search with optional query')
//  .command('list', 'list packages installed', {isDefault: true})


