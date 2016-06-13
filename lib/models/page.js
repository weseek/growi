module.exports = function(crowi) {
  var debug = require('debug')('crowi:models:page')
    , mongoose = require('mongoose')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , GRANT_PUBLIC = 1
    , GRANT_RESTRICTED = 2
    , GRANT_SPECIFIED = 3
    , GRANT_OWNER = 4
    , PAGE_GRANT_ERROR = 1

    , pageEvent = crowi.event('page')

    , pageSchema;

  function isPortalPath(path) {
    if (path.match(/.*\/$/)) {
      return true;
    }

    return false;
  }

  pageSchema = new mongoose.Schema({
    path: { type: String, required: true, index: true },
    revision: { type: ObjectId, ref: 'Revision' },
    redirectTo: { type: String, index: true },
    grant: { type: Number, default: GRANT_PUBLIC, index: true },
    grantedUsers: [{ type: ObjectId, ref: 'User' }],
    creator: { type: ObjectId, ref: 'User', index: true },
    liker: [{ type: ObjectId, ref: 'User', index: true }],
    seenUsers: [{ type: ObjectId, ref: 'User', index: true }],
    commentCount: { type: Number, default: 0 },
    extended: {
      type: String,
      default: '{}',
      get: function(data) {
        try {
          return JSON.parse(data);
        } catch(e) {
          return data;
        }
      },
      set: function(data) {
        return JSON.stringify(data);
      }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }, {
    toJSON: {getters: true},
    toObject: {getters: true}
  });

  pageEvent.on('create', pageEvent.onCreate);
  pageEvent.on('update', pageEvent.onUpdate);

  pageSchema.methods.isPublic = function() {
    if (!this.grant || this.grant == GRANT_PUBLIC) {
      return true;
    }

    return false;
  };

  pageSchema.methods.isPortal = function() {
    return isPortalPath(this.path);
  };

  pageSchema.methods.isCreator = function(userData) {
    if (this.populated('creator') && this.creator._id.toString() === userData._id.toString()) {
      return true;
    } else if (this.creator.toString() === userData._id.toString()) {
      return true
    }

    return false;
  };

  pageSchema.methods.isGrantedFor = function(userData) {
    if (this.isPublic() || this.isCreator(userData)) {
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
    return this.liker.some(function(likedUser) {
      return likedUser == userData._id.toString();
    });
  };

  pageSchema.methods.like = function(userData) {
    var self = this,
      Page = self;

      return new Promise(function(resolve, reject) {
        var added = self.liker.addToSet(userData._id);
        if (added.length > 0) {
          self.save(function(err, data) {
            if (err) {
              return reject(err);
            }
            debug('liker updated!', added);
            return resolve(data);
          });
        } else {
          debug('liker not updated');
          return reject(self);
        }
      });

  };

  pageSchema.methods.unlike = function(userData, callback) {
    var self = this,
      Page = self;

      return new Promise(function(resolve, reject) {
        var beforeCount = self.liker.length;
        self.liker.pull(userData._id);
        if (self.liker.length != beforeCount) {
          self.save(function(err, data) {
            if (err) {
              return reject(err);
            }
            return resolve(data);
          });
        } else {
          debug('liker not updated');
          return reject(self);
        }
      });

  };

  pageSchema.methods.isSeenUser = function(userData) {
    var self = this,
      Page = self;

      return this.seenUsers.some(function(seenUser) {
        return seenUser.equals(userData._id);
      });
  };

  pageSchema.methods.seen = function(userData) {
    var self = this,
      Page = self;

      if (this.isSeenUser(userData)) {
        debug('seenUsers not updated');
        return Promise.resolve(this);
      }

      return new Promise(function(resolve, reject) {
        if (!userData || !userData._id) {
          reject(new Error('User data is not valid'));
        }

        var added = self.seenUsers.addToSet(userData);
        self.save(function(err, data) {
          if (err) {
            return reject(err);
          }

          debug('seenUsers updated!', added);
          return resolve(self);
        });
      });
  };

  pageSchema.methods.getSlackChannel = function() {
    var extended = this.get('extended');
    if (!extended) {
      return '';
    }

    return extended.slack || '';
  };

  pageSchema.methods.updateSlackChannel = function(slackChannel) {
    var extended = this.extended;
    extended.slack = slackChannel;

    return this.updateExtended(extended);
  };

  pageSchema.methods.updateExtended = function(extended) {
    var page = this;
    page.extended = extended;
    return new Promise(function(resolve, reject) {
      return page.save(function(err, doc) {
        if (err) {
          return reject(err);
        }
        return resolve(doc);
      });
    });
  };

  pageSchema.statics.populatePageData = function(pageData, revisionId) {
    var Page = crowi.model('Page');
    var User = crowi.model('User');

    pageData.latestRevision = pageData.revision;
    if (revisionId) {
      pageData.revision = revisionId;
    }
    pageData.likerCount = pageData.liker.length || 0;
    pageData.seenUsersCount = pageData.seenUsers.length || 0;

    return new Promise(function(resolve, reject) {
      pageData.populate([
        {path: 'creator', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'revision', model: 'Revision'},
        //{path: 'liker', options: { limit: 11 }},
        //{path: 'seenUsers', options: { limit: 11 }},
      ], function (err, pageData) {
        Page.populate(pageData, {path: 'revision.author', model: 'User', select: User.USER_PUBLIC_FIELDS}, function(err, data) {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    });
  };

  pageSchema.statics.populatePageListToAnyObjects = function(pageIdObjectArray) {
    var Page = this;
    var pageIdMappings = {};
    var pageIds = pageIdObjectArray.map(function(page, idx) {
      if (!page._id) {
        throw new Error('Pass the arg of populatePageListToAnyObjects() must have _id on each element.');
      }

      pageIdMappings[String(page._id)] = idx;
      return page._id;
    });

    return new Promise(function(resolve, reject) {
      Page.findListByPageIds(pageIds, {limit: 100}) // limit => if the pagIds is greater than 100, ignore
      .then(function(pages) {
        pages.forEach(function(page) {
          Object.assign(pageIdObjectArray[pageIdMappings[String(page._id)]], page._doc);
        });

        resolve(pageIdObjectArray);
      });
    });
  };

  pageSchema.statics.updateCommentCount = function (page, num)
  {
    var self = this;

    return new Promise(function(resolve, reject) {
      self.update({_id: page}, {commentCount: num}, {}, function(err, data) {
        if (err) {
          debug('Update commentCount Error', err);
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  pageSchema.statics.hasPortalPage = function (path, user) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.findPage(path, user)
      .then(function(page) {
        resolve(page);
      }).catch(function(err) {
        resolve(null); // check only has portal page, through error
      });
    });
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

  pageSchema.statics.getUserPagePath = function(user) {
    return '/user/' + user.username;
  };

  pageSchema.statics.isCreatableName = function(name) {
    var forbiddenPages = [
      /\^|\$|\*|\+|\#/,
      /^\/_api\/.*/,
      /^\/\-\/.*/,
      /^\/_r\/.*/,
      /^\/user\/[^\/]+\/(bookmarks|comments|activities|pages|recent-create|recent-edit)/, // reserved
      /^http:\/\/.+$/, // avoid miss in renaming
      /.+\/edit$/,
      /.+\.md$/,
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
    .sort({updatedAt: -1})
    .skip(offset)
    .limit(limit)
    .exec(function(err, data) {
      cb(err, data);
    });
  };

  pageSchema.statics.findPageById = function(id) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      Page.findOne({_id: id}, function(err, pageData) {
        if (err) {
          return reject(err);
        }

        if (pageData == null) {
          return reject(new Error('Page not found'));
        }
        return Page.populatePageData(pageData, null).then(resolve);
      });
    });
  };

  pageSchema.statics.findPageByIdAndGrantedUser = function(id, userData) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      Page.findPageById(id)
      .then(function(pageData) {
        if (userData && !pageData.isGrantedFor(userData)) {
          return reject(new Error('Page is not granted for the user')); //PAGE_GRANT_ERROR, null);
        }

        return resolve(pageData);
      }).catch(function(err) {
        return reject(err);
      });
    });
  };

  // find page and check if granted user
  pageSchema.statics.findPage = function(path, userData, revisionId, ignoreNotFound) {
    var self = this;

    return new Promise(function(resolve, reject) {
      self.findOne({path: path}, function(err, pageData) {
        if (err) {
          return reject(err);
        }

        if (pageData === null) {
          if (ignoreNotFound) {
            return resolve(null);
          }

          var pageNotFoundError = new Error('Page Not Found')
          pageNotFoundError.name = 'Crowi:Page:NotFound';
          return reject(pageNotFoundError);
        }

        if (!pageData.isGrantedFor(userData)) {
          return reject(new Error('Page is not granted for the user')); //PAGE_GRANT_ERROR, null);
        }

        self.populatePageData(pageData, revisionId || null).then(resolve).catch(reject);
      });
    });
  };

  // find page by path
  pageSchema.statics.findPageByPath = function(path) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      Page.findOne({path: path}, function(err, pageData) {
        if (err || pageData === null) {
          return reject(err);
        }

        return resolve(pageData);
      });
    });
  };

  pageSchema.statics.findListByPageIds = function(ids, options) {
    var Page = this;
    var User = crowi.model('User');
    var options = options || {}
      , limit = options.limit || 50
      , offset = options.skip || 0
      ;

    return new Promise(function(resolve, reject) {
      Page
      .find({ _id: { $in: ids }, grant: GRANT_PUBLIC })
      //.sort({createdAt: -1}) // TODO optionize
      .skip(offset)
      .limit(limit)
      .populate([
        {path: 'creator', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'revision', model: 'Revision'},
      ])
      .exec(function(err, pages) {
        if (err) {
          return reject(err);
        }

        Page.populate(pages, {path: 'revision.author', model: 'User', select: User.USER_PUBLIC_FIELDS}, function(err, data) {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    });
  };

  /**
   * とりあえず、公開ページであり、redirectTo が無いものだけを出すためだけのAPI
   */
  pageSchema.statics.findListByCreator = function(user, option) {
    var Page = this;
    var User = crowi.model('User');
    var limit = option.limit || 50;
    var offset = option.offset || 0;

    return new Promise(function(resolve, reject) {
      Page
      .find({ creator: user._id, grant: GRANT_PUBLIC, redirectTo: null })
      .sort({createdAt: -1})
      .skip(offset)
      .limit(limit)
      .populate('revision')
      .exec()
      .then(function(pages) {
        return Page.populate(pages, {path: 'revision.author', model: 'User', select: User.USER_PUBLIC_FIELDS}).then(resolve);
      });
    });
  };

  /**
   * Bulk get (for internal only)
   */
  pageSchema.statics.getStreamOfFindAll = function(options) {
    var Page = this
      , options = options || {}
      , publicOnly = options.publicOnly || true
      , criteria = {redirectTo: null,}
      ;

    if (publicOnly) {
      criteria.grant = GRANT_PUBLIC;
    }

    return this.find(criteria)
      .populate([
        {path: 'creator', model: 'User'},
        {path: 'revision', model: 'Revision'},
      ])
      .sort({updatedAt: -1})
      .stream();
  };

  /**
   * findListByStartWith
   *
   * If `path` has `/` at the end, returns '{path}/*' and '{path}' self.
   * If `path` doesn't have `/` at the end, returns '{path}*'
   * e.g.
   */
  pageSchema.statics.findListByStartWith = function(path, userData, option) {
    var Page = this;
    var User = crowi.model('User');
    var pathCondition = [];

    if (!option) {
      option = {sort: 'updatedAt', desc: -1, offset: 0, limit: 50};
    }
    var opt = {
      sort: option.sort || 'updatedAt',
      desc: option.desc || -1,
      offset: option.offset || 0,
      limit: option.limit || 50
    };
    var sortOpt = {};
    sortOpt[opt.sort] = opt.desc;
    var queryReg = new RegExp('^' + path);
    var sliceOption = option.revisionSlice || {$slice: 1};

    pathCondition.push({path: queryReg});
    if (path.match(/\/$/)) {
      debug('Page list by ending with /, so find also upper level page');
      pathCondition.push({path: path.substr(0, path.length -1)});
    }

    return new Promise(function(resolve, reject) {
      // FIXME: might be heavy
      var q = Page.find({
        redirectTo: null,
        $or: [
          {grant: null},
          {grant: GRANT_PUBLIC},
          {grant: GRANT_RESTRICTED, grantedUsers: userData._id},
          {grant: GRANT_SPECIFIED, grantedUsers: userData._id},
          {grant: GRANT_OWNER, grantedUsers: userData._id},
        ],})
        .populate('revision')
        .and({
          $or: pathCondition
        })
        .sort(sortOpt)
        .skip(opt.offset)
        .limit(opt.limit);

      q.exec()
      .then(function(pages) {
        Page.populate(pages, {path: 'revision.author', model: 'User', select: User.USER_PUBLIC_FIELDS})
        .then(resolve)
        .catch(reject);
      })
    });
  };

  pageSchema.statics.updatePageProperty = function(page, updateData) {
    var Page = this;
    return new Promise(function(resolve, reject) {
      // TODO foreach して save
      Page.update({_id: page._id}, {$set: updateData}, function(err, data) {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  pageSchema.statics.updateGrant = function(page, grant, userData) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      page.grant = grant;
      if (grant == GRANT_PUBLIC) {
        page.grantedUsers = [];
      } else {
        page.grantedUsers = [];
        page.grantedUsers.push(userData._id);
      }

      page.save(function(err, data) {
        debug('Page.updateGrant, saved grantedUsers.', err, data);
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  };

  // Instance method でいいのでは
  pageSchema.statics.pushToGrantedUsers = function(page, userData) {

    return new Promise(function(resolve, reject) {
      if (!page.grantedUsers || !Array.isArray(page.grantedUsers)) {
        page.grantedUsers = [];
      }
      page.grantedUsers.push(userData);
      page.save(function(err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  };

  pageSchema.statics.pushRevision = function(pageData, newRevision, user) {
    var isCreate = false;
    if (pageData.revision === undefined) {
      debug('pushRevision on Create');
      isCreate = true;
    }

    return new Promise(function(resolve, reject) {
      newRevision.save(function(err, newRevision) {
        if (err) {
          debug('Error on saving revision', err);
          return reject(err);
        }

        debug('Successfully saved new revision', newRevision);
        pageData.revision = newRevision;
        pageData.updatedAt = Date.now();
        pageData.save(function(err, data) {
          if (err) {
            // todo: remove new revision?
            debug('Error on save page data (after push revision)', err);
            return reject(err);
          }

          resolve(data);
          if (!isCreate) {
            debug('pushRevision on Update');
          }
        });
      });
    });
  };

  pageSchema.statics.create = function(path, body, user, options) {
    var Page = this
      , Revision = crowi.model('Revision')
      , format = options.format || 'markdown'
      , grant = options.grant || GRANT_PUBLIC
      , redirectTo = options.redirectTo || null;

    // force public
      if (isPortalPath(path)) {
        grant = GRANT_PUBLIC;
      }

      return new Promise(function(resolve, reject) {
        Page.findOne({path: path}, function(err, pageData) {
          if (pageData) {
            return reject(new Error('Cannot create new page to existed path'));
          }

          var newPage = new Page();
          newPage.path = path;
          newPage.creator = user;
          newPage.createdAt = Date.now();
          newPage.updatedAt = Date.now();
          newPage.redirectTo = redirectTo;
          newPage.grant = grant;
          newPage.grantedUsers = [];
          newPage.grantedUsers.push(user);

          newPage.save(function (err, newPage) {
            if (err) {
              return reject(err);
            }

            var newRevision = Revision.prepareRevision(newPage, body, user, {format: format});
            Page.pushRevision(newPage, newRevision, user).then(function(data) {
              resolve(data);
              pageEvent.emit('create', data, user);
            }).catch(function(err) {
              debug('Push Revision Error on create page', err);
              return reject(err);
            });
          });
        });
      });
  };

  pageSchema.statics.updatePage = function(pageData, body, user, options) {
    var Page = this
      , Revision = crowi.model('Revision')
      , grant = options.grant || null
      ;
    // update existing page
    var newRevision = Revision.prepareRevision(pageData, body, user);

    return new Promise(function(resolve, reject) {
      Page.pushRevision(pageData, newRevision, user)
      .then(function(revision) {
        if (grant != pageData.grant) {
          return Page.updateGrant(pageData, grant, user).then(function(data) {
            debug('Page grant update:', data);
            resolve(data);
            pageEvent.emit('update', data, user);
          });
        } else {
          resolve(pageData);
          pageEvent.emit('update', pageData, user);
        }
      }).catch(function(err) {
        debug('Error on update', err);
        debug('Error on update', err.stack);
      });
    });
  };

  pageSchema.statics.rename = function(pageData, newPagePath, user, options) {
    var Page = this
      , Revision = crowi.model('Revision')
      , path = pageData.path
      , createRedirectPage = options.createRedirectPage || 0
      , moveUnderTrees     = options.moveUnderTrees || 0;

    return new Promise(function(resolve, reject) {
      // pageData の path を変更
      Page.updatePageProperty(pageData, {updatedAt: Date.now(), path: newPagePath})
      .then(function(data) {
        debug('Before ', pageData);
        // reivisions の path を変更
        return Revision.updateRevisionListByPath(path, {path: newPagePath}, {})
      }).then(function(data) {
        debug('After ', pageData);
        pageData.path = newPagePath;

        if (createRedirectPage) {
          var body = 'redirect ' + newPagePath;
          Page.create(path, body, user, {redirectTo: newPagePath}).then(resolve).catch(reject);
        } else {
          resolve(data);
        }
        pageEvent.emit('update', pageData, user); // update as renamed page
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

  return mongoose.model('Page', pageSchema);
};
