module.exports = function(app, models) {
  var mongoose = require('mongoose')
    , debug = require('debug')('crowi:models:page')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , GRANT_PUBLIC = 1
    , GRANT_RESTRICTED = 2
    , GRANT_SPECIFIED = 3
    , GRANT_OWNER = 4
    , PAGE_GRANT_ERROR = 1
    , pageSchema;

  function populatePageData(pageData, revisionId, callback) {
    debug('pageData', pageData.revision);
    if (revisionId) {
      pageData.revision = revisionId;
    }

    pageData.latestRevision = pageData.revision;
    pageData.populate([
      {path: 'revision', model: 'Revision'},
      {path: 'liker', options: { limit: 11 }},
      {path: 'seenUsers', options: { limit: 11 }},
    ], function (err, pageData) {
      models.Page.populate(pageData, {path: 'revision.author', model: 'User'}, function(err, pageData) {
        return callback(err, pageData);
      });
    });
  }

  pageSchema = new mongoose.Schema({
    path: { type: String, required: true, index: true },
    revision: { type: ObjectId, ref: 'Revision' },
    redirectTo: { type: String, index: true },
    grant: { type: Number, default: GRANT_PUBLIC, index: true },
    grantedUsers: [{ type: ObjectId, ref: 'User' }],
    liker: [{ type: ObjectId, ref: 'User', index: true }],
    seenUsers: [{ type: ObjectId, ref: 'User', index: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  });

  pageSchema.methods.isPublic = function() {
    if (!this.grant || this.grant == GRANT_PUBLIC) {
      return true;
    }

    return false;
  };

  pageSchema.methods.isGrantedFor = function(userData) {
    if (this.isPublic()) {
      return true;
    }

    if (this.grantedUsers.indexOf(userData._id) >= 0) {
      return true;
    }

    return false;
  };

  pageSchema.methods.isLatestRevision = function() {
    // populate されていなくて判断できない
    if (!this.latestRevision || !this.revision) {
      return true;
    }

    return (this.latestRevision == this.revision._id.toString());
  };

  pageSchema.methods.isUpdatable = function(previousRevision) {
    var revision = this.latestRevision || this.revision;
    if (revision != previousRevision) {
      return false;
    }
    return true;
  };

  pageSchema.methods.isLiked = function(userData) {
    if (undefined === this.populated('liker')) {
      if (this.liker.indexOf(userData._id) != -1) {
        return true;
      }
      return true;
    } else {
      return this.liker.some(function(likedUser) {
        return likedUser._id.toString() == userData._id.toString();
      });
    }
  };

  pageSchema.methods.like = function(userData, callback) {
    var self = this;
    if (undefined === this.populated('liker')) {
      var added = this.liker.addToSet(userData._id);
      if (added.length > 0) {
        this.save(function(err, data) {
          debug('liker updated!', added);
          return callback(err, data);
        });
      } else {
        debug('liker not updated');
        return callback(null, this);
      }
    } else {
      models.Page.update(
        {_id: self._id},
        { $addToSet: { liker:  userData._id }},
        function(err, numAffected, raw) {
          debug('Updated liker,', err, numAffected, raw);
          callback(null, self);
        }
      );
    }
  };

  pageSchema.methods.unlike = function(userData, callback) {
    var self = this;
    if (undefined === this.populated('liker')) {
      var removed = this.liker.pull(userData._id);
      if (removed.length > 0) {
        this.save(function(err, data) {
          debug('unlike updated!', removed);
          return callback(err, data);
        });
      } else {
        debug('unlike not updated');
        callback(null, this);
      }
    } else {
      models.Page.update(
        {_id: self._id},
        { $pull: { liker:  userData._id }},
        function(err, numAffected, raw) {
          debug('Updated liker (unlike)', err, numAffected, raw);
          callback(null, self);
        }
      );
    }
  };

  pageSchema.methods.seen = function(userData, callback) {
    var self = this;
    if (undefined === this.populated('seenUsers')) {
      var added = this.seenUsers.addToSet(userData._id);
      if (added.length > 0) {
        this.save(function(err, data) {
          debug('seenUsers updated!', added);
          return callback(err, data);
        });
      } else {
        debug('seenUsers not updated');
        return callback(null, this);
      }
    } else {
      models.Page.update(
        {_id: self._id},
        { $addToSet: { seenUsers:  userData._id }},
        function(err, numAffected, raw) {
          debug('Updated seenUsers,', err, numAffected, raw);
          callback(null, self);
        }
      );
    }
  };

  pageSchema.statics.getGrantLabels = function() {
    var grantLabels = {};
    grantLabels[GRANT_PUBLIC]     = '公開';
    grantLabels[GRANT_RESTRICTED] = 'リンクを知っている人のみ';
    //grantLabels[GRANT_SPECIFIED]  = '特定ユーザーのみ';
    grantLabels[GRANT_OWNER]      = '自分のみ';

    return grantLabels;
  };

  pageSchema.statics.normalizePath = function(path) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }

    return path;
  };

  pageSchema.statics.isCreatableName = function(name) {
    var forbiddenPages = [
      /\^|\$|\*|\+/,
      /^\/_api\/.*/,
      /^\/\-\/.*/,
      /^\/_r\/.*/,
      /.+\/edit$/,
      /^\/(installer|register|login|logout|admin|me|files|trash|paste|comments).+/,
    ];

    var isCreatable = true;
    forbiddenPages.forEach(function(page) {
      var pageNameReg = new RegExp(page);
      if (name.match(pageNameReg)) {
        isCreatable = false;
        return ;
      }
    });

    return isCreatable;
  };

  pageSchema.statics.updateRevision = function(pageId, revisionId, cb) {
    this.update({_id: pageId}, {revision: revisionId}, {}, function(err, data) {
      cb(err, data);
    });
  };

  pageSchema.statics.findUpdatedList = function(offset, limit, cb) {
    this
      .find({})
      .sort('updatedAt', -1)
      .skip(offset)
      .limit(limit)
      .exec(function(err, data) {
        cb(err, data);
      });
  };

  pageSchema.statics.findPageById = function(id, userData, cb) {
    var Page = this;

    this.findOne({_id: id}, function(err, pageData) {
      if (pageData === null) {
        return cb(new Error('Page Not Found'), null);
      }

      if (!pageData.isGrantedFor(userData)) {
        return cb(PAGE_GRANT_ERROR, null);
      }

      return populatePageData(pageData, null, cb);
    });
  };

  pageSchema.statics.findPage = function(path, userData, revisionId, options, cb) {
    var Page = this;

    this.findOne({path: path}, function(err, pageData) {
      if (pageData === null) {
        return cb(new Error('Page Not Found'), null);
      }

      if (!pageData.isGrantedFor(userData)) {
        return cb(PAGE_GRANT_ERROR, null);
      }

      return populatePageData(pageData, revisionId, cb);
    });
  };

  pageSchema.statics.findListByPageIds = function(ids, options, cb) {
  };

  pageSchema.statics.findListByStartWith = function(path, userData, options, cb) {
    if (!options) {
      options = {sort: 'updatedAt', desc: -1, offset: 0, limit: 50};
    }
    var opt = {
      sort: options.sort || 'updatedAt',
      desc: options.desc || -1,
      offset: options.offset || 0,
      limit: options.limit || 50
    };
    var sortOpt = {};
    sortOpt[opt.sort] = opt.desc;
    var queryReg = new RegExp('^' + path);
    var sliceOption = options.revisionSlice || {$slice: 1};

    var q = this.find({
        path: queryReg,
        redirectTo: null,
        $or: [
          {grant: null},
          {grant: GRANT_PUBLIC},
          {grant: GRANT_RESTRICTED, grantedUsers: userData._id},
          {grant: GRANT_SPECIFIED, grantedUsers: userData._id},
          {grant: GRANT_OWNER, grantedUsers: userData._id},
        ],
      })
      .populate('revision')
      .sort(sortOpt)
      .skip(opt.offset)
      .limit(opt.limit);

    q.exec(function(err, data) {
      cb(err, data);
    });
  };

  pageSchema.statics.updatePage = function(page, updateData, cb) {
    // TODO foreach して save
    this.update({_id: page._id}, {$set: updateData}, function(err, data) {
      return cb(err, data);
    });
  };

  pageSchema.statics.updateGrant = function(page, grant, userData, cb) {
    this.update({_id: page._id}, {$set: {grant: grant}}, function(err, data) {
      if (grant == GRANT_PUBLIC) {
        page.grantedUsers = [];
      } else {
        page.grantedUsers = [];
        page.grantedUsers.push(userData._id);
      }
      page.save(function(err, data) {
        return cb(err, data);
      });
    });
  };

  // Instance method でいいのでは
  pageSchema.statics.pushToGrantedUsers = function(page, userData, cb) {
    if (!page.grantedUsers || !Array.isArray(page.grantedUsers)) {
      page.grantedUsers = [];
    }
    page.grantedUsers.push(userData._id);
    page.save(function(err, data) {
      return cb(err, data);
    });
  };

  pageSchema.statics.pushRevision = function(pageData, newRevision, user, cb) {
    pageData.revision = newRevision._id;
    pageData.updatedAt = Date.now();

    newRevision.save(function(err, newRevision) {
      pageData.save(function(err, data) {
        if (err) {
          console.log('Error on save page data', err);
          cb(err, null);
          return;
        }
        cb(err, data);
      });
    });
  };

  pageSchema.statics.create = function(path, body, user, options, cb) {
    var Page = this
      , format = options.format || 'markdown'
      , redirectTo = options.redirectTo || null;

    this.findOne({path: path}, function(err, pageData) {
      if (pageData) {
        cb(new Error('Cannot create new page to existed path'), null);
        return;
      }

      var newPage = new Page();
      newPage.path = path;
      newPage.createdAt = Date.now();
      newPage.updatedAt = Date.now();
      newPage.redirectTo = redirectTo;
      newPage.save(function (err, newPage) {

        var newRevision = models.Revision.prepareRevision(newPage, body, user, {format: format});
        Page.pushRevision(newPage, newRevision, user, function(err, data) {
          if (err) {
            console.log('Push Revision Error on create page', err);
          }
          cb(err, data);
          return;
        });
      });
    });
  };

  pageSchema.statics.rename = function(pageData, newPageName, user, options, cb) {
    var Page = this
      , path = pageData.path
      , createRedirectPage = options.createRedirectPage || 0
      , moveUnderTrees     = options.moveUnderTrees || 0;

    // pageData の path を変更
    this.updatePage(pageData, {updatedAt: Date.now(), path: newPageName}, function(err, data) {
      if (err) {
        return cb(err, null);
      }

      // reivisions の path を変更
      models.Revision.updateRevisionListByPath(path, {path: newPageName}, {}, function(err, data) {
        if (err) {
          return cb(err, null);
        }

        pageData.path = newPageName;
        if (createRedirectPage) {
          Page.create(path, 'redirect ' + newPageName, user, {redirectTo: newPageName}, function(err, data) {
            // @TODO error handling
            return cb(err, pageData);
          });
        } else {
          return cb(err, pageData);
        }
      });
    });
  };

  pageSchema.statics.getHistories = function() {
    // TODO
    return;
  };

  pageSchema.statics.GRANT_PUBLIC = GRANT_PUBLIC;
  pageSchema.statics.GRANT_RESTRICTED = GRANT_RESTRICTED;
  pageSchema.statics.GRANT_SPECIFIED = GRANT_SPECIFIED;
  pageSchema.statics.GRANT_OWNER = GRANT_OWNER;
  pageSchema.statics.PAGE_GRANT_ERROR = PAGE_GRANT_ERROR;

  models.Page = mongoose.model('Page', pageSchema);

  return models.Page;
};
