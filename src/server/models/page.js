const debug = require('debug')('growi:models:page');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

const escapeStringRegexp = require('escape-string-regexp');

const templateChecker = require('@commons/util/template-checker');

/*
 * define schema
 */
const GRANT_PUBLIC = 1
  , GRANT_RESTRICTED = 2
  , GRANT_SPECIFIED = 3
  , GRANT_OWNER = 4
  , GRANT_USER_GROUP = 5
  , PAGE_GRANT_ERROR = 1

  , STATUS_PUBLISHED  = 'published'
  , STATUS_DELETED    = 'deleted'
;
const pageSchema = new mongoose.Schema({
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
// apply plugins
pageSchema.plugin(uniqueValidator);

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

class PageQueryBuilder {
  constructor(query) {
    this.query = query;
  }

  addConditionToFilteringByViewer(user, userGroups) {
    this.query = this.query.or([
      {grant: null},
      {grant: GRANT_PUBLIC},
      {grant: GRANT_RESTRICTED, grantedUsers: user._id},
      {grant: GRANT_SPECIFIED, grantedUsers: user._id},
      {grant: GRANT_OWNER, grantedUsers: user._id},
      {grant: GRANT_USER_GROUP, grantedGroup: { $in: userGroups }},
    ]);

    return this;
  }
}

module.exports = function(crowi) {
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

  pageSchema.methods.isDeleted = function() {
    return this.status === STATUS_DELETED;
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
    return this.seenUsers.includes(userData._id);
  };

  pageSchema.methods.seen = async function(userData) {
    if (this.isSeenUser(userData)) {
      debug('seenUsers not updated');
      return this;
    }

    if (!userData || !userData._id) {
      throw new Error('User data is not valid');
    }

    const added = this.seenUsers.addToSet(userData);
    const saved = await this.save();

    debug('seenUsers updated!', added);

    return saved;
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

  pageSchema.methods.populateDataToShow = async function(revisionId) {
    validateCrowi();

    const User = crowi.model('User');

    this.latestRevision = this.revision;
    if (revisionId != null) {
      this.revision = revisionId;
    }
    this.likerCount = this.liker.length || 0;
    this.seenUsersCount = this.seenUsers.length || 0;

    return this
      .populate([
        {path: 'lastUpdateUser', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'creator', model: 'User', select: User.USER_PUBLIC_FIELDS},
        {path: 'revision', model: 'Revision', populate: {
          path: 'author', model: 'User', select: User.USER_PUBLIC_FIELDS
        }},
        //{path: 'liker', options: { limit: 11 }},
        //{path: 'seenUsers', options: { limit: 11 }},
      ])
      .execPopulate();
  };

  pageSchema.methods.populateDataToMakePresentation = async function(revisionId) {
    this.latestRevision = this.revision;
    if (revisionId != null) {
      this.revision = revisionId;
    }
    return this.populate('revision').execPopulate();
  };

  // TODO abolish or migrate
  // https://weseek.myjetbrains.com/youtrack/issue/GC-1185
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

  // https://weseek.myjetbrains.com/youtrack/issue/GC-1224
  // remove populate
  pageSchema.statics.findOneById = async function(id) {
    return this.findOne({_id: id});
  };

  /**
   * @param {string} id ObjectId
   * @param {User} user User instance
   */
  // https://weseek.myjetbrains.com/youtrack/issue/GC-1224
  //
  // TODO check whether NotFound or Forbidden in router
  // org: findPageByIdAndGrantedUser
  pageSchema.statics.findOneByIdAndViewer = async function(id, user) {
    validateCrowi();

    // const Page = this;
    const baseQuery = this.findOne({_id: id});

    const UserGroupRelation = crowi.model('UserGroupRelation');
    let userGroups = [];
    if (user != null) {
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    const queryBuilder = new PageQueryBuilder(baseQuery);
    queryBuilder.addConditionToFilteringByViewer(user, userGroups);

    return await queryBuilder.query.exec();
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

  pageSchema.statics.findPageByPathAndViewer = async function(path, user) {
    validateCrowi();

    if (path == null) {
      throw new Error('path is required.');
    }

    // const Page = this;
    const baseQuery = this.findOne({path});

    const UserGroupRelation = crowi.model('UserGroupRelation');
    let userGroups = [];
    if (user != null) {
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    const queryBuilder = new PageQueryBuilder(baseQuery);
    queryBuilder.addConditionToFilteringByViewer(user, userGroups);

    return await queryBuilder.query.exec();
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
    // ignore other pages than descendants
    path = this.addSlashOfEnd(path);
    // add option to escape the regex strings
    const combinedOption = Object.assign({isRegExpEscapedFromPath: true}, option);

    return this.findListByStartWith(path, userData, combinedOption);
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

  async function pushRevision(pageData, newRevision, user, grant, grantUserGroupId) {
    await newRevision.save();
    debug('Successfully saved new revision', newRevision);

    pageData.revision = newRevision;
    pageData.lastUpdateUser = user;
    pageData.updatedAt = Date.now();

    return pageData.save();
  }

  async function applyGrant(page, user, grant, grantUserGroupId) {
    if (grant == GRANT_USER_GROUP && grantUserGroupId == null) {
      throw new Error('grant userGroupId is not specified');
    }

    page.grant = grant;
    if (grant == GRANT_PUBLIC || grant == GRANT_USER_GROUP) {
      page.grantedUsers = [];
    }
    else {
      page.grantedUsers = [];
      page.grantedUsers.push(user._id);
    }

    if (grant == GRANT_USER_GROUP) {
      const UserGroupRelation = crowi.model('UserGroupRelation');
      const count = await UserGroupRelation.countByGroupIdAndUser(grantUserGroupId, user);

      if (count === 0) {
        throw new Error('no relations were exist for group and user.');
      }
    }
  }

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
        newPage.status = STATUS_PUBLISHED;
        applyGrant(newPage, user, grant, grantUserGroupId);

        return newPage.save();
      })
      .then((newPage) => {
        savedPage = newPage;
      })
      .then(() => {
        const newRevision = Revision.prepareRevision(savedPage, body, user, {format: format});
        return pushRevision(savedPage, newRevision, user);
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
    applyGrant(pageData, user, grant, grantUserGroupId);
    let savedPage = await pageData.save();
    const newRevision = await Revision.prepareRevision(pageData, body, user);
    const revision = await pushRevision(savedPage, newRevision, user, grant, grantUserGroupId);
    savedPage = await Page.findPageByPath(revision.path).populate('revision').populate('creator');

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
