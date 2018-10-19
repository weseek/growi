/**
 * The Exception class thrown when the user has no grant to see the page
 *
 * @class UserHasNoGrantException
 */
class UserHasNoGrantException {
  constructor(message, user) {
    this.name = this.constructor.name;
    this.message = message;
    this.user = user;
  }
}

module.exports = function(crowi) {
  const debug = require('debug')('growi:models:page')
    , mongoose = require('mongoose')
    , escapeStringRegexp = require('escape-string-regexp')
    , templateChecker = require('@commons/util/template-checker')
    , ObjectId = mongoose.Schema.Types.ObjectId
    , GRANT_PUBLIC = 1
    , GRANT_RESTRICTED = 2
    , GRANT_SPECIFIED = 3
    , GRANT_OWNER = 4
    , GRANT_USER_GROUP = 5
    , PAGE_GRANT_ERROR = 1

    , STATUS_WIP        = 'wip'
    , STATUS_PUBLISHED  = 'published'
    , STATUS_DELETED    = 'deleted'
    , STATUS_DEPRECATED = 'deprecated'
  ;

  let pageSchema;
  let pageEvent;

  // init event
  if (crowi != null) {
    pageEvent = crowi.event('page');
    pageEvent.on('create', pageEvent.onCreate);
    pageEvent.on('update', pageEvent.onUpdate);
  }

  function isPortalPath(path) {
    if (path.match(/.*\/$/)) {
      return true;
    }

    return false;
  }

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

  pageSchema = new mongoose.Schema({
    path: { type: String, required: true, index: true, unique: true },
    revision: { type: ObjectId, ref: 'Revision' },
    redirectTo: { type: String, index: true },
    status: { type: String, default: STATUS_PUBLISHED, index: true },
    grant: { type: Number, default: GRANT_PUBLIC, index: true },
    grantedUsers: [{ type: ObjectId, ref: 'User' }],
    grantedGroup: { type: ObjectId, ref: 'UserGroup', index: true },
    creator: { type: ObjectId, ref: 'User', index: true },
    lastUpdateUser: { type: ObjectId, ref: 'User', index: true },
    liker: [{ type: ObjectId, ref: 'User', index: true }],
    seenUsers: [{ type: ObjectId, ref: 'User', index: true }],
    commentCount: { type: Number, default: 0 },
    extended: {
      type: String,
      default: '{}',
      get: function(data) {
        try {
          return JSON.parse(data);
        }
        catch (e) {
          return data;
        }
      },
      set: function(data) {
        return JSON.stringify(data);
      }
    },
    pageIdOnHackmd: String,
    revisionHackmdSynced: { type: ObjectId, ref: 'Revision' },  // the revision that is synced to HackMD
    hasDraftOnHackmd: { type: Boolean },                        // set true if revision and revisionHackmdSynced are same but HackMD document has modified
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }, {
    toJSON: {getters: true},
    toObject: {getters: true}
  });

  pageSchema.methods.isWIP = function() {
    return this.status === STATUS_WIP;
  };

  pageSchema.methods.isPublished = function() {
    // null: this is for B.C.
    return this.status === null || this.status === STATUS_PUBLISHED;
  };

  pageSchema.methods.isDeleted = function() {
    return this.status === STATUS_DELETED;
  };

  pageSchema.methods.isDeprecated = function() {
    return this.status === STATUS_DEPRECATED;
  };

  pageSchema.methods.isPublic = function() {
    if (!this.grant || this.grant == GRANT_PUBLIC) {
      return true;
    }

    return false;
  };

  pageSchema.methods.isPortal = function() {
    return isPortalPath(this.path);
  };

  pageSchema.methods.isTemplate = function() {
    return templateChecker(this.path);
  };

  pageSchema.methods.isGrantedFor = function(userData) {
    if (this.isPublic()) {
      return true;
    }

    if (userData != null && this.grantedUsers.indexOf(userData._id) >= 0) {
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
      }
      else {
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
      }
      else {
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
    const extended = this.get('extended');
    if (!extended) {
      return '';
    }

    return extended.slack || '';
  };

  pageSchema.methods.updateSlackChannel = function(slackChannel) {
    const extended = this.extended;
    extended.slack = slackChannel;

    return this.updateExtended(extended);
  };

  pageSchema.methods.updateExtended = function(extended) {
    const page = this;
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
    validateCrowi();

    const Page = crowi.model('Page');
    const User = crowi.model('User');

    pageData.latestRevision = pageData.revision;
    if (revisionId) {
      pageData.revision = revisionId;
    }
    pageData.likerCount = pageData.liker.length || 0;
    pageData.seenUsersCount = pageData.seenUsers.length || 0;

    return new Promise(function(resolve, reject) {
      pageData.populate([
        {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'creator', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'revision', model: 'Revision'},
        //{path: 'liker', options: { limit: 11 }},
        //{path: 'seenUsers', options: { limit: 11 }},
      ], function(err, pageData) {
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

  pageSchema.statics.updateCommentCount = function(pageId) {
    validateCrowi();

    const self = this;
    const Comment = crowi.model('Comment');
    return Comment.countCommentByPageId(pageId)
    .then(function(count) {
      self.update({_id: pageId}, {commentCount: count}, {}, function(err, data) {
        if (err) {
          debug('Update commentCount Error', err);
          throw err;
        }

        return data;
      });
    });
  };

  pageSchema.statics.hasPortalPage = function(path, user, revisionId) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.findPage(path, user, revisionId)
      .then(function(page) {
        resolve(page);
      }).catch(function(err) {
        resolve(null); // check only has portal page, through error
      });
    });
  };

  pageSchema.statics.getGrantLabels = function() {
    var grantLabels = {};
    grantLabels[GRANT_PUBLIC]     = 'Public'; // 公開
    grantLabels[GRANT_RESTRICTED] = 'Anyone with the link'; // リンクを知っている人のみ
    //grantLabels[GRANT_SPECIFIED]  = 'Specified users only'; // 特定ユーザーのみ
    grantLabels[GRANT_USER_GROUP] = 'Only inside the group'; // 特定グループのみ
    grantLabels[GRANT_OWNER]      = 'Just me'; // 自分のみ

    return grantLabels;
  };

  pageSchema.statics.normalizePath = function(path) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }

    path = path.replace(/\/\s+?/g, '/').replace(/\s+\//g, '/');

    return path;
  };

  pageSchema.statics.getUserPagePath = function(user) {
    return '/user/' + user.username;
  };

  pageSchema.statics.getDeletedPageName = function(path) {
    if (path.match('\/')) {
      path = path.substr(1);
    }
    return '/trash/' + path;
  };

  pageSchema.statics.getRevertDeletedPageName = function(path) {
    return path.replace('\/trash', '');
  };

  pageSchema.statics.isDeletableName = function(path) {
    var notDeletable = [
      /^\/user\/[^\/]+$/, // user page
    ];

    for (var i = 0; i < notDeletable.length; i++) {
      var pattern = notDeletable[i];
      if (path.match(pattern)) {
        return false;
      }
    }

    return true;
  };

  pageSchema.statics.isCreatableName = function(name) {
    var forbiddenPages = [
      /\^|\$|\*|\+|#|%/,
      /^\/-\/.*/,
      /^\/_r\/.*/,
      /^\/_apix?(\/.*)?/,
      /^\/?https?:\/\/.+$/, // avoid miss in renaming
      /\/{2,}/,             // avoid miss in renaming
      /\s+\/\s+/,           // avoid miss in renaming
      /.+\/edit$/,
      /.+\.md$/,
      /^\/(installer|register|login|logout|admin|me|files|trash|paste|comments)(\/.*|$)/,
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

  pageSchema.statics.fixToCreatableName = function(path) {
    return path
      .replace(/\/\//g, '/')
    ;
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

  pageSchema.statics.findPageById = async function(id) {
    const page = await this.findOne({_id: id});
    if (page == null) {
      throw new Error('Page not found');
    }

    return this.populatePageData(page, null);
  };

  pageSchema.statics.findPageByIdAndGrantedUser = function(id, userData) {
    validateCrowi();

    const Page = this;
    const PageGroupRelation = crowi.model('PageGroupRelation');
    let pageData = null;

    return new Promise(function(resolve, reject) {
      Page.findPageById(id)
      .then(function(result) {
        pageData = result;
        if (userData && !pageData.isGrantedFor(userData)) {
          return PageGroupRelation.isExistsGrantedGroupForPageAndUser(pageData, userData);
        }
        else {
          return true;
        }
      }).then((checkResult) => {
        console.log(checkResult);
        if (checkResult) {
          return resolve(pageData);
        }
        else  {
          return reject(new Error('Page is not granted for the user')); //PAGE_GRANT_ERROR, null);
        }
      }).catch(function(err) {
        return reject(err);
      });
    });
  };

  // find page and check if granted user
  pageSchema.statics.findPage = async function(path, userData, revisionId, ignoreNotFound) {
    validateCrowi();

    const PageGroupRelation = crowi.model('PageGroupRelation');

    const pageData = await this.findOne({path: path});

    if (pageData == null) {
      if (ignoreNotFound) {
        return null;
      }

      const pageNotFoundError = new Error('Page Not Found');
      pageNotFoundError.name = 'Crowi:Page:NotFound';
      throw new Error(pageNotFoundError);
    }

    if (!pageData.isGrantedFor(userData)) {
      const isRelationExists = await PageGroupRelation.isExistsGrantedGroupForPageAndUser(pageData, userData);
      if (isRelationExists) {
        return await this.populatePageData(pageData, revisionId || null);
      }
      else {
        throw new UserHasNoGrantException('Page is not granted for the user', userData);
      }
    }
    else {
      return await this.populatePageData(pageData, revisionId || null);
    }
  };

  /**
   * find all templates applicable to the new page
   */
  pageSchema.statics.findTemplate = function(path) {
    const Page = this;
    const templatePath = cutOffLastSlash(path);
    const pathList = generatePathsOnTree(templatePath, []);
    const regexpList = pathList.map(path => new RegExp(`^${escapeStringRegexp(path)}/_{1,2}template$`));

    return Page
      .find({path: {$in: regexpList}})
      .populate({path: 'revision', model: 'Revision'})
      .then(templates => {
        return fetchTemplate(templates, templatePath);
      });
  };

  const cutOffLastSlash = path => {
    const lastSlash = path.lastIndexOf('/');
    return path.substr(0, lastSlash);
  };

  const generatePathsOnTree = (path, pathList) => {
    pathList.push(path);

    if (path === '') {
      return pathList;
    }

    const newPath = cutOffLastSlash(path);

    return generatePathsOnTree(newPath, pathList);
  };

  const assignTemplateByType = (templates, path, type) => {
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].path === `${path}/${type}template`) {
        return templates[i];
      }
    }
  };

  const assignDecendantsTemplate = (decendantsTemplates, path) => {
    const decendantsTemplate = assignTemplateByType(decendantsTemplates, path, '__');
    if (decendantsTemplate) {
      return decendantsTemplate;
    }

    if (path === '') {
      return;
    }

    const newPath = cutOffLastSlash(path);
    return assignDecendantsTemplate(decendantsTemplates, newPath);
  };

  const fetchTemplate = (templates, templatePath) => {
    let templateBody;
    /**
     * get children template
     * __tempate: applicable only to immediate decendants
     */
    const childrenTemplate = assignTemplateByType(templates, templatePath, '_');

    /**
     * get decendants templates
     * _tempate: applicable to all pages under
     */
    const decendantsTemplate = assignDecendantsTemplate(templates, templatePath);

    if (childrenTemplate) {
      templateBody =  childrenTemplate.revision.body;
    }
    else if (decendantsTemplate) {
      templateBody = decendantsTemplate.revision.body;
    }

    return templateBody;
  };

  // find page by path
  pageSchema.statics.findPageByPath = function(path) {
    if (path == null) {
      return null;
    }
    return this.findOne({path});
  };

  pageSchema.statics.findListByPageIds = function(ids, options) {
    validateCrowi();

    const Page = this;
    const User = crowi.model('User');
    const limit = options.limit || 50
      , offset = options.skip || 0
      ;
    options = options || {};

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

        Page.populate(pages, {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS}, function(err, data) {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    });
  };

  pageSchema.statics.findPageByRedirectTo = function(path) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      Page.findOne({redirectTo: path}, function(err, pageData) {
        if (err || pageData === null) {
          return reject(err);
        }

        return resolve(pageData);
      });
    });
  };

  pageSchema.statics.findListByCreator = async function(user, option, currentUser) {
    validateCrowi();

    let Page = this;
    let User = crowi.model('User');
    let limit = option.limit || 50;
    let offset = option.offset || 0;
    let conditions = setPageListConditions(user);

    let pages =  await Page.find(conditions).sort({createdAt: -1}).skip(offset).limit(limit).populate('revision').exec();
    let PagesList = await Page.populate(pages, {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS});
    let totalCount = await Page.countListByCreator(user);
    let PagesArray = [
      {totalCount: totalCount}
    ];
    PagesArray.push(PagesList);
    return PagesArray;
  };
  function setPageListConditions(user) {
    const conditions = {
      creator: user._id,
      redirectTo: null,
      $and: [
        {$or: [
          {status: null},
          {status: STATUS_PUBLISHED},
        ]},
        {$or: [
          {grant: GRANT_PUBLIC},
          {grant: GRANT_USER_GROUP},
        ]}],
    };

    return conditions;
  }

  pageSchema.statics.countListByCreator = function(user) {
    let Page = this;
    let conditions = setPageListConditions(user);

    return Page.find(conditions).count();
  };


  /**
   * Bulk get (for internal only)
   */
  pageSchema.statics.getStreamOfFindAll = function(options) {
    var Page = this
      , options = options || {}
      , publicOnly = options.publicOnly || true
      , criteria = {redirectTo: null, }
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
      .cursor();
  };

  /**
   * find the page that is match with `path` and its descendants
   */
  pageSchema.statics.findListWithDescendants = function(path, userData, option) {
    var Page = this;

    // ignore other pages than descendants
    path = Page.addSlashOfEnd(path);
    // add option to escape the regex strings
    const combinedOption = Object.assign({isRegExpEscapedFromPath: true}, option);

    return Page.findListByStartWith(path, userData, combinedOption);
  };

  /**
   * find pages that start with `path`
   *
   * see the comment of `generateQueryToListByStartWith` function
   */
  pageSchema.statics.findListByStartWith = function(path, userData, option) {
    validateCrowi();

    const Page = this;
    const User = crowi.model('User');

    if (!option) {
      option = {sort: 'updatedAt', desc: -1, offset: 0, limit: 50};
    }
    const opt = {
      sort: option.sort || 'updatedAt',
      desc: option.desc || -1,
      offset: option.offset || 0,
      limit: option.limit || 50
    };
    const sortOpt = {};
    sortOpt[opt.sort] = opt.desc;

    const isPopulateRevisionBody = option.isPopulateRevisionBody || false;

    return new Promise(function(resolve, reject) {
      let q = Page.generateQueryToListByStartWith(path, userData, option)
        .sort(sortOpt)
        .skip(opt.offset)
        .limit(opt.limit);

      // retrieve revision data
      if (isPopulateRevisionBody) {
        q = q.populate('revision');
      }
      else {
        q = q.populate('revision', '-body');  // exclude body
      }

      q.exec()
        .then(function(pages) {
          Page.populate(pages, {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS})
          .then(resolve)
          .catch(reject);
        });
    });
  };

  /**
   * generate the query to find the page that is match with `path` and its descendants
   */
  pageSchema.statics.generateQueryToListWithDescendants = function(path, userData, option) {
    var Page = this;

    // ignore other pages than descendants
    path = Page.addSlashOfEnd(path);

    // add option to escape the regex strings
    const combinedOption = Object.assign({isRegExpEscapedFromPath: true}, option);

    return Page.generateQueryToListByStartWith(path, userData, combinedOption);
  };

  /**
   * generate the query to find pages that start with `path`
   *
   * (GROWI) If 'isRegExpEscapedFromPath' is true, `path` should have `/` at the end
   *   -> returns '{path}/*' and '{path}' self.
   * (Crowi) If 'isRegExpEscapedFromPath' is false and `path` has `/` at the end
   *   -> returns '{path}*'
   * (Crowi) If 'isRegExpEscapedFromPath' is false and `path` doesn't have `/` at the end
   *   -> returns '{path}*'
   *
   * *option*
   *   - includeDeletedPage -- if true, search deleted pages (default: false)
   *   - isRegExpEscapedFromPath -- if true, the regex strings included in `path` is escaped (default: false)
   */
  pageSchema.statics.generateQueryToListByStartWith = function(path, userData, option) {
    var Page = this;
    var pathCondition = [];
    var includeDeletedPage = option.includeDeletedPage || false;
    var isRegExpEscapedFromPath = option.isRegExpEscapedFromPath || false;

    /*
     * 1. add condition for finding the page completely match with `path` w/o last slash
     */
    let pathSlashOmitted = path;
    if (path.match(/\/$/)) {
      pathSlashOmitted = path.substr(0, path.length -1);
      pathCondition.push({path: pathSlashOmitted});
    }

    /*
     * 2. add decendants
     */
    var pattern = (isRegExpEscapedFromPath)
      ? escapeStringRegexp(path)  // escape
      : pathSlashOmitted;

    var queryReg = new RegExp('^' + pattern);
    pathCondition.push({path: queryReg});

    var q = Page.find({
      redirectTo: null,
      $or: [
        {grant: null},
        {grant: GRANT_PUBLIC},
        {grant: GRANT_RESTRICTED, grantedUsers: userData._id},
        {grant: GRANT_SPECIFIED, grantedUsers: userData._id},
        {grant: GRANT_OWNER, grantedUsers: userData._id},
        {grant: GRANT_USER_GROUP},
      ], })
      .and({
        $or: pathCondition
      });

    if (!includeDeletedPage) {
      q.and({
        $or: [
          {status: null},
          {status: STATUS_PUBLISHED},
        ],
      });
    }

    return q;
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

  pageSchema.statics.updateGrant = function(page, grant, userData, grantUserGroupId) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      if (grant == GRANT_USER_GROUP && grantUserGroupId == null) {
        reject('grant userGroupId is not specified');
      }

      page.grant = grant;
      if (grant == GRANT_PUBLIC || grant == GRANT_USER_GROUP) {
        page.grantedUsers = [];
      }
      else {
        page.grantedUsers = [];
        page.grantedUsers.push(userData._id);
      }

      page.save(function(err, data) {
        debug('Page.updateGrant, saved grantedUsers.', err, data);
        if (err) {
          return reject(err);
        }

        Page.updateGrantUserGroup(page, grant, grantUserGroupId, userData)
        .then(() => {
          return resolve(data);
        });
      });
    });
  };

  pageSchema.statics.updateGrantUserGroup = function(page, grant, grantUserGroupId, userData) {
    validateCrowi();

    const UserGroupRelation = crowi.model('UserGroupRelation');
    const PageGroupRelation = crowi.model('PageGroupRelation');

    // グループの場合
    if (grant == GRANT_USER_GROUP) {
      debug('grant is usergroup', grantUserGroupId);
      return UserGroupRelation.findByGroupIdAndUser(grantUserGroupId, userData)
      .then((relation) => {
        if (relation == null) {
          return new Error('no relations were exist for group and user.');
        }
        return PageGroupRelation.findOrCreateRelationForPageAndGroup(page, relation.relatedGroup);
      })
      .catch((err) => {
        return new Error('No UserGroup is exists. userGroupId : ', grantUserGroupId);
      });
    }
    else {
      return PageGroupRelation.removeAllByPage(page);
    }

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

  pageSchema.statics.pushRevision = async function(pageData, newRevision, user) {
    await newRevision.save();
    debug('Successfully saved new revision', newRevision);

    pageData.revision = newRevision;
    pageData.lastUpdateUser = user;
    pageData.updatedAt = Date.now();

    return pageData.save();
  };

  pageSchema.statics.create = function(path, body, user, options = {}) {
    validateCrowi();

    const Page = this
      , Revision = crowi.model('Revision')
      , format = options.format || 'markdown'
      , redirectTo = options.redirectTo || null
      , grantUserGroupId = options.grantUserGroupId || null
      , socketClientId = options.socketClientId || null
      ;

    let grant = options.grant || GRANT_PUBLIC;

    // sanitize path
    path = crowi.xss.process(path);

    // force public
    if (isPortalPath(path)) {
      grant = GRANT_PUBLIC;
    }

    let savedPage = undefined;
    return Page.findOne({path: path})
      .then(pageData => {
        if (pageData) {
          throw new Error('Cannot create new page to existed path');
        }

        const newPage = new Page();
        newPage.path = path;
        newPage.creator = user;
        newPage.lastUpdateUser = user;
        newPage.createdAt = Date.now();
        newPage.updatedAt = Date.now();
        newPage.redirectTo = redirectTo;
        newPage.grant = grant;
        newPage.status = STATUS_PUBLISHED;
        newPage.grantedUsers = [];
        newPage.grantedUsers.push(user);

        return newPage.save();
      })
      .then((newPage) => {
        savedPage = newPage;
      })
      .then(() => {
        const newRevision = Revision.prepareRevision(savedPage, body, user, {format: format});
        return Page.pushRevision(savedPage, newRevision, user);
      })
      .then(() => {
        return Page.updateGrantUserGroup(savedPage, grant, grantUserGroupId, user);
      })
      .then(() => {
        if (socketClientId != null) {
          pageEvent.emit('create', savedPage, user, socketClientId);
        }
        return savedPage;
      });
  };

  pageSchema.statics.updatePage = async function(pageData, body, user, options = {}) {
    validateCrowi();

    const Page = this
      , Revision = crowi.model('Revision')
      , grant = options.grant || null
      , grantUserGroupId = options.grantUserGroupId || null
      , isSyncRevisionToHackmd = options.isSyncRevisionToHackmd
      , socketClientId = options.socketClientId || null
      ;

    // update existing page
    const newRevision = await Revision.prepareRevision(pageData, body, user);

    const revision = await Page.pushRevision(pageData, newRevision, user);
    let savedPage = await Page.findPageByPath(revision.path).populate('revision').populate('creator');
    if (grant != null) {
      const grantData = await Page.updateGrant(savedPage, grant, user, grantUserGroupId);
      debug('Page grant update:', grantData);
    }

    if (isSyncRevisionToHackmd) {
      savedPage = await Page.syncRevisionToHackmd(savedPage);
    }

    if (socketClientId != null) {
      pageEvent.emit('update', savedPage, user, socketClientId);
    }
    return savedPage;
  };

  pageSchema.statics.deletePage = async function(pageData, user, options = {}) {
    const Page = this
      , newPath = Page.getDeletedPageName(pageData.path)
      , isTrashed = checkIfTrashed(pageData.path)
      , socketClientId = options.socketClientId || null
      ;

    if (Page.isDeletableName(pageData.path)) {
      if (isTrashed) {
        return Page.completelyDeletePage(pageData, user, options);
      }

      let updatedPageData = await Page.rename(pageData, newPath, user, {createRedirectPage: true});
      await Page.updatePageProperty(updatedPageData, {status: STATUS_DELETED, lastUpdateUser: user});

      if (socketClientId != null) {
        pageEvent.emit('delete', updatedPageData, user, socketClientId);
      }
      return updatedPageData;
    }
    else {
      return Promise.reject('Page is not deletable.');
    }
  };

  const checkIfTrashed = (path) => {
    return (path.search(/^\/trash/) !== -1);
  };

  pageSchema.statics.deletePageRecursively = function(pageData, user, options) {
    const Page = this
      , path = pageData.path
      , isTrashed = checkIfTrashed(pageData.path)
      ;
    options = options || {};

    if (isTrashed) {
      return Page.completelyDeletePageRecursively(pageData, user, options);
    }

    return Page.generateQueryToListWithDescendants(path, user, options)
      .then(function(pages) {
        return Promise.all(pages.map(function(page) {
          return Page.deletePage(page, user, options);
        }));
      })
      .then(function(data) {
        return pageData;
      });

  };

  pageSchema.statics.revertDeletedPage = function(pageData, user, options) {
    const Page = this
      , newPath = Page.getRevertDeletedPageName(pageData.path)
      ;

    // 削除時、元ページの path には必ず redirectTo 付きで、ページが作成される。
    // そのため、そいつは削除してOK
    // が、redirectTo ではないページが存在している場合それは何かがおかしい。(データ補正が必要)
    return new Promise(function(resolve, reject) {
      Page.findPageByPath(newPath)
      .then(function(originPageData) {
        if (originPageData.redirectTo !== pageData.path) {
          throw new Error('The new page of to revert is exists and the redirect path of the page is not the deleted page.');
        }

        return Page.completelyDeletePage(originPageData, options);
      }).then(function(done) {
        return Page.updatePageProperty(pageData, {status: STATUS_PUBLISHED, lastUpdateUser: user});
      }).then(function(done) {
        pageData.status = STATUS_PUBLISHED;

        debug('Revert deleted the page, and rename again it', pageData, newPath);
        return Page.rename(pageData, newPath, user, {});
      }).then(function(done) {
        pageData.path = newPath;
        resolve(pageData);
      }).catch(reject);
    });
  };

  pageSchema.statics.revertDeletedPageRecursively = function(pageData, user, options = {}) {
    const Page = this
      , path = pageData.path
      ;
    options = Object.assign({ includeDeletedPage: true }, options);

    return new Promise(function(resolve, reject) {
      Page
        .generateQueryToListWithDescendants(path, user, options)
        .exec()
        .then(function(pages) {
          Promise.all(pages.map(function(page) {
            return Page.revertDeletedPage(page, user, options);
          }))
          .then(function(data) {
            return resolve(data[0]);
          });
        });
    });
  };

  /**
   * This is danger.
   */
  pageSchema.statics.completelyDeletePage = function(pageData, user, options = {}) {
    validateCrowi();

    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Bookmark = crowi.model('Bookmark')
      , Attachment = crowi.model('Attachment')
      , Comment = crowi.model('Comment')
      , Revision = crowi.model('Revision')
      , PageGroupRelation = crowi.model('PageGroupRelation')
      , Page = this
      , pageId = pageData._id
      , socketClientId = options.socketClientId || null
      ;

    debug('Completely delete', pageData.path);

    return new Promise(function(resolve, reject) {
      Bookmark.removeBookmarksByPageId(pageId)
      .then(function(done) {
      }).then(function(done) {
        return Attachment.removeAttachmentsByPageId(pageId);
      }).then(function(done) {
        return Comment.removeCommentsByPageId(pageId);
      }).then(function(done) {
        return Revision.removeRevisionsByPath(pageData.path);
      }).then(function(done) {
        return Page.removePageById(pageId);
      }).then(function(done) {
        return Page.removeRedirectOriginPageByPath(pageData.path);
      }).then(function(done) {
        return PageGroupRelation.removeAllByPage(pageData);
      }).then(function(done) {
        if (socketClientId != null) {
          pageEvent.emit('delete', pageData, user, socketClientId); // update as renamed page
        }
        resolve(pageData);
      }).catch(reject);
    });
  };

  pageSchema.statics.completelyDeletePageRecursively = function(pageData, user, options = {}) {
    // Delete Bookmarks, Attachments, Revisions, Pages and emit delete
    const Page = this
      , path = pageData.path
      ;
    options = Object.assign({ includeDeletedPage: true }, options);

    return new Promise(function(resolve, reject) {
      Page
      .generateQueryToListWithDescendants(path, user, options)
      .then(function(pages) {
        Promise.all(pages.map(function(page) {
          return Page.completelyDeletePage(page, user, options);
        }))
        .then(function(data) {
          return resolve(data[0]);
        });
      });
    });
  };

  pageSchema.statics.removePageById = function(pageId) {
    var Page = this;

    return new Promise(function(resolve, reject) {
      Page.remove({_id: pageId}, function(err, done) {
        debug('Remove phisiaclly, the page', pageId, err, done);
        if (err) {
          return reject(err);
        }

        resolve(done);
      });
    });
  };

  pageSchema.statics.removePageByPath = function(pagePath) {
    var Page = this;

    return Page.findPageByPath(pagePath)
      .then(function(pageData) {
        return Page.removePageById(pageData.id);
      });
  };

  /**
   * remove the page that is redirecting to specified `pagePath` recursively
   *  ex: when
   *    '/page1' redirects to '/page2' and
   *    '/page2' redirects to '/page3'
   *    and given '/page3',
   *    '/page1' and '/page2' will be removed
   *
   * @param {string} pagePath
   */
  pageSchema.statics.removeRedirectOriginPageByPath = function(pagePath) {
    var Page = this;

    return Page.findPageByRedirectTo(pagePath)
      .then((redirectOriginPageData) => {
        // remove
        return Page.removePageById(redirectOriginPageData.id)
          // remove recursive
          .then(() => {
            return Page.removeRedirectOriginPageByPath(redirectOriginPageData.path);
          });
      })
      .catch((err) => {
        // do nothing if origin page doesn't exist
        return Promise.resolve();
      });
  };

  pageSchema.statics.rename = async function(pageData, newPagePath, user, options) {
    validateCrowi();

    const Page = this
      , Revision = crowi.model('Revision')
      , path = pageData.path
      , createRedirectPage = options.createRedirectPage || 0
      , socketClientId = options.socketClientId || null
      ;

    // sanitize path
    newPagePath = crowi.xss.process(newPagePath);

    await Page.updatePageProperty(pageData, {updatedAt: Date.now(), path: newPagePath, lastUpdateUser: user});
    // reivisions の path を変更
    await Revision.updateRevisionListByPath(path, {path: newPagePath}, {});

    if (createRedirectPage) {
      const body = 'redirect ' + newPagePath;
      await Page.create(path, body, user, {redirectTo: newPagePath});
    }

    let updatedPageData = await Page.findOne({path: newPagePath});
    pageEvent.emit('delete', pageData, user, socketClientId);
    pageEvent.emit('create', updatedPageData, user, socketClientId);

    return updatedPageData;
  };

  pageSchema.statics.renameRecursively = function(pageData, newPagePathPrefix, user, options) {
    validateCrowi();

    const Page = this
      , path = pageData.path
      , pathRegExp = new RegExp('^' + escapeStringRegexp(path), 'i');

    // sanitize path
    newPagePathPrefix = crowi.xss.process(newPagePathPrefix);

    return Page.generateQueryToListWithDescendants(path, user, options)
      .then(function(pages) {
        return Promise.all(pages.map(function(page) {
          const newPagePath = page.path.replace(pathRegExp, newPagePathPrefix);
          return Page.rename(page, newPagePath, user, options);
        }));
      })
      .then(function() {
        pageData.path = newPagePathPrefix;
        return pageData;
      });
  };

  /**
   * associate GROWI page and HackMD page
   * @param {Page} pageData
   * @param {string} pageIdOnHackmd
   */
  pageSchema.statics.registerHackmdPage = function(pageData, pageIdOnHackmd) {
    if (pageData.pageIdOnHackmd != null) {
      throw new Error(`'pageIdOnHackmd' of the page '${pageData.path}' is not empty`);
    }

    pageData.pageIdOnHackmd = pageIdOnHackmd;

    return this.syncRevisionToHackmd(pageData);
  };

  /**
   * update revisionHackmdSynced
   * @param {Page} pageData
   * @param {bool} isSave whether save or not
   */
  pageSchema.statics.syncRevisionToHackmd = function(pageData, isSave = true) {
    pageData.revisionHackmdSynced = pageData.revision;
    pageData.hasDraftOnHackmd = false;

    let returnData = pageData;
    if (isSave) {
      returnData = pageData.save();
    }
    return returnData;
  };

  /**
   * update hasDraftOnHackmd
   * !! This will be invoked many time from many people !!
   *
   * @param {Page} pageData
   * @param {Boolean} newValue
   */
  pageSchema.statics.updateHasDraftOnHackmd = async function(pageData, newValue) {
    if (pageData.hasDraftOnHackmd === newValue) {
      // do nothing when hasDraftOnHackmd equals to newValue
      return;
    }

    pageData.hasDraftOnHackmd = newValue;
    return pageData.save();
  };

  pageSchema.statics.getHistories = function() {
    // TODO
    return;
  };

  /**
   * return path that added slash to the end for specified path
   */
  pageSchema.statics.addSlashOfEnd = function(path) {
    let returnPath = path;
    if (!path.match(/\/$/)) {
      returnPath += '/';
    }
    return returnPath;
  };

  pageSchema.statics.GRANT_PUBLIC = GRANT_PUBLIC;
  pageSchema.statics.GRANT_RESTRICTED = GRANT_RESTRICTED;
  pageSchema.statics.GRANT_SPECIFIED = GRANT_SPECIFIED;
  pageSchema.statics.GRANT_OWNER = GRANT_OWNER;
  pageSchema.statics.GRANT_USER_GROUP = GRANT_USER_GROUP;
  pageSchema.statics.PAGE_GRANT_ERROR = PAGE_GRANT_ERROR;

  return mongoose.model('Page', pageSchema);
};
