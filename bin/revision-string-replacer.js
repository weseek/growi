var cli = require('cli')
 , mongo   = require('mongoose')
 , async   = require('async')
 ;

cli.setUsage('MONGO_URI=mongodb://user:password@host/dbnae node bin/revision-string-replacer.js --from=\'aaa\' --to=\'bbb\'\n\n  This means that replace string "aaa" to "bbb" from all revisions.');
cli.parse({
    from: [false, 'Specified string is a target to replace.', 'string'],
    to: [false, 'Replace string which specified by "from" to this string.', 'string'],
    dry: [false, 'Dry run', 'boolean'],
});


cli.main(function(args, options)
{
  var app = {set: function(v) { }}
    , c = this
    , from = options.from
    , to = options.to
    , dry = options.dry
    ;

  console.log('This scriprt is not working now. Should be fixed.');
  cli.exit(1);

  if (!to || !from) {
    cli.error('"to" and "from" options are required.\n');
    cli.output(cli.getUsage());
    cli.exit(1);
    return ;
  }

  var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || false;
  if (!mongoUri) {
    cli.error('Please set MONGO_URI env.\n');
    cli.output(cli.getUsage());
    cli.exit(1);
    return;
  }

  mongo.connect(mongoUri);

  // あー config 読み込み＆model読み込み周りを app.js から切り離さないといけないにゃぁ
  configModel = require('../lib/models/config')(app);

  async.series([
    function (next) {
      configModel.loadAllConfig(function(err, doc) {

        return next();
      });
    }, function (next) {
      var config = app.set('config');

      models = require('../lib/models')(app);
      models.Config = configModel;

      return next();
    }, function (next) {
      var limit = 100000;
      c.spinner('Load revisions..');
      models.Revision.find().limit(limit).exec(function(err, revs) {
        c.spinner('Load revisions.. done!\n', true);
        var count = Object.keys(revs).length
          , i = 0
          , matched = 0
          , matchedWords = 0
          ;

        c.output('Found ' + count + ' revisions.\n');
        c.output('Start replacing.\n');

        async.each(revs, function(rev, cb) {
          var regexp = new RegExp(from, 'g');
          c.progress(++i/count);

          var m = rev.body.match(regexp);
          if (!m) {
            return cb();
          }

          matched++;
          matchedWords += m.length;
          if (dry) {
            return cb();
          } else {
            rev.body = rev.body.replace(regexp, to);
            rev.save(function(err, s) {
              if (err) {
                c.error('Error on:' + rev.path);
              } else {
              }
              return cb();
            });
          }
        }, function(err) {
          if (dry) {
            cli.info(matchedWords + ' words in (' + matched + ' of ' + count + ') revisions will be replaced!');
          } else {
            cli.ok(matchedWords + ' words in (' + matched + ' of ' + count + ') revisions replaced!');
          }
          return next();
        });
      });
    }
  , function (next) {
      cli.ok('Finished!');
      mongo.disconnect();
      return next();
    }
  ]);
});
