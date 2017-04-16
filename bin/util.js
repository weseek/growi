var program = require('commander')
  , debug = require('debug')('crowi:console:util')
  , colors = require('colors')
  , crowi = new (require('../lib/crowi'))(__dirname + '/../', process.env)
  ;

crowi.init()
  .then(function(app) {
    program
      .version(crowi.version);

    program
      .command('count-page-length')
      .action(function (cmd, env) {
        var Page = crowi.model('Page');
        var stream = Page.getStreamOfFindAll();
        var pages = [];

        stream.on('data', function (doc) {
          if (!doc.creator || !doc.revision) {
            return ;
          }

          pages.push({
            path: doc.path,
            body: doc.revision.body,
            author: doc.creator.username,
          });
        }).on('error', function (err) {
          // TODO: handle err
          debug('Error stream:', err);
        }).on('close', function () {
          // all done

          pages.forEach(function(page, i) {
            console.log('%d\t%s', page.body.length, page.path);
          });

          process.exit(0);
        });
      });

    program.parse(process.argv);
  }).catch(crowi.exitOnError);
