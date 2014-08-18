/**
 * Fakie::app.js
 *
 * @package Fakie
 * @author  Sotaro KARASAWA <sotarok@crocos.co.jp>
 * @version 0.0.0
 */

var util    = require('util');
var config  = require('config');
var mongo   = require('mongoose');
var async   = require('async');

var user  =     require('../../lib/user');
var page  =     require('../../lib/page');
var revision  = require('../../lib/revision');

mongo.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + '/' + config.mongodb.dbname);
module.exports = {
  user: user
  ,page: page
  ,revision: revision
};


var options = {
  offset: 0,
  limit : 999,
  revisionSlice: {$slice: 9999}
};

var q = page.Page.findListByStartWith('/', options, function(err, docs) {
  var i = 0;
  async.forEach(docs, function(data, cb) {
    var ii = 0;
    var path = data.path;
    var pageId = data._id;
    console.log("path: ", data._id, path);

    async.forEachSeries(data.revisions, function(rData, rcb) {
      var newRevision = new revision.Revision();
      newRevision.path      = path;
      newRevision.body      = rData.body;
      newRevision.format    = rData.format;
      newRevision.createdAt = rData.createdAt;
      newRevision.save(function (err, n) {
        if (!err) {
          console.log("    ", path, ii++, rData.createdAt, " ... ok", n._id);
        } else {
          console.log("    ", path, ii++, rData.createdAt, " ... ERROR!");
          console.log(err);
        }
        rcb();
      });
      //rcb();
    }, function (rErr) {
      console.log("    ", path, " all revision imported.");
      revision.Revision.findLatestRevision(path, function(err, fr) {
        page.Page.updateRevision(pageId, fr._id, function(err, frr) {
          if (!err) {
            console.log("        Page revision updated", pageId, path, i++);
          } else {
            console.log("        Page revision update ERROR", pageId, path, i++);
          }
          cb();
        });
      });
    });
  }, function(err) {
    console.log('end');
    mongo.disconnect();
  });
});
