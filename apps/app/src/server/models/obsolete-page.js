import { PageGrant, GroupType } from '@growi/core';
import { templateChecker, pagePathUtils, pathUtils } from '@growi/core/dist/utils';
import escapeStringRegexp from 'escape-string-regexp';

import ExternalUserGroup from '~/features/external-user-group/server/models/external-user-group';
import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import loggerFactory from '~/utils/logger';

import UserGroup from './user-group';
import UserGroupRelation from './user-group-relation';


// disable no-return-await for model functions
/* eslint-disable no-return-await */

/* eslint-disable no-use-before-define */

const nodePath = require('path');

const differenceInYears = require('date-fns/differenceInYears');
const debug = require('debug')('growi:models:page');
const mongoose = require('mongoose');
const urljoin = require('url-join');

const { isTopPage, isTrashPage } = pagePathUtils;
const { checkTemplatePath } = templateChecker;

const logger = loggerFactory('growi:models:page');

const GRANT_PUBLIC = 1;
const GRANT_RESTRICTED = 2;
const GRANT_SPECIFIED = 3;
const GRANT_OWNER = 4;
const GRANT_USER_GROUP = 5;
const PAGE_GRANT_ERROR = 1;
const STATUS_PUBLISHED = 'published';
const STATUS_DELETED = 'deleted';

// schema definition has moved to page.ts
const pageSchema = {
  statics: {},
  methods: {},
};

/**
 * return an array of ancestors paths that is extracted from specified pagePath
 * e.g.
 *  when `pagePath` is `/foo/bar/baz`,
 *  this method returns [`/foo/bar/baz`, `/foo/bar`, `/foo`, `/`]
 *
 * @param {string} pagePath
 * @return {string[]} ancestors paths
 */
export const extractToAncestorsPaths = (pagePath) => {
  const ancestorsPaths = [];

  let parentPath;
  while (parentPath !== '/') {
    parentPath = nodePath.dirname(parentPath || pagePath);
    ancestorsPaths.push(parentPath);
  }

  return ancestorsPaths;
};

/**
 * populate page (Query or Document) to show revision
 * @param {any} page Query or Document
 * @param {string} userPublicFields string to set to select
 * @param {boolean} shouldExcludeBody boolean indicating whether to include 'revision.body' or not
 */
/* eslint-disable object-curly-newline, object-property-newline */
export const populateDataToShowRevision = (page, userPublicFields, shouldExcludeBody = false) => {
  return page
    .populate([
      { path: 'lastUpdateUser', select: userPublicFields },
      { path: 'creator', select: userPublicFields },
      { path: 'deleteUser', select: userPublicFields },
      { path: 'grantedGroups.item' },
      { path: 'revision', select: shouldExcludeBody ? '-body' : undefined, populate: {
        path: 'author', select: userPublicFields,
      } },
    ]);
};
/* eslint-enable object-curly-newline, object-property-newline */


export const getPageSchema = (crowi) => {
  let pageEvent;

  // init event
  if (crowi != null) {
    pageEvent = crowi.event('page');
    pageEvent.on('create', pageEvent.onCreate);
    pageEvent.on('update', pageEvent.onUpdate);
    pageEvent.on('createMany', pageEvent.onCreateMany);
    pageEvent.on('addSeenUsers', pageEvent.onAddSeenUsers);
  }

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

  pageSchema.methods.isDeleted = function() {
    return isTrashPage(this.path);
  };

  pageSchema.methods.isPublic = function() {
    if (!this.grant || this.grant === GRANT_PUBLIC) {
      return true;
    }

    return false;
  };

  pageSchema.methods.isTopPage = function() {
    return isTopPage(this.path);
  };

  pageSchema.methods.isTemplate = function() {
    return checkTemplatePath(this.path);
  };

  pageSchema.methods.isLatestRevision = function() {
    // populate されていなくて判断できない
    if (!this.latestRevision || !this.revision) {
      return true;
    }

    // comparing ObjectId with string
    // eslint-disable-next-line eqeqeq
    return (this.latestRevision == this.revision._id.toString());
  };

  pageSchema.methods.findRelatedTagsById = async function() {
    const PageTagRelation = mongoose.model('PageTagRelation');
    const relations = await PageTagRelation.find({ relatedPage: this._id }).populate('relatedTag');
    return relations.map((relation) => { return relation.relatedTag.name });
  };

  pageSchema.methods.isUpdatable = function(previousRevision) {
    const revision = this.latestRevision || this.revision;
    // comparing ObjectId with string
    // eslint-disable-next-line eqeqeq
    if (revision != previousRevision) {
      return false;
    }
    return true;
  };

  pageSchema.methods.isLiked = function(user) {
    if (user == null || user._id == null) {
      return false;
    }

    return this.liker.some((likedUserId) => {
      return likedUserId.toString() === user._id.toString();
    });
  };

  pageSchema.methods.like = function(userData) {
    const self = this;

    return new Promise(((resolve, reject) => {
      const added = self.liker.addToSet(userData._id);
      if (added.length > 0) {
        self.save((err, data) => {
          if (err) {
            return reject(err);
          }
          logger.debug('liker updated!', added);
          return resolve(data);
        });
      }
      else {
        logger.debug('liker not updated');
        return reject(new Error('Already liked'));
      }
    }));
  };

  pageSchema.methods.unlike = function(userData, callback) {
    const self = this;

    return new Promise(((resolve, reject) => {
      const beforeCount = self.liker.length;
      self.liker.pull(userData._id);
      if (self.liker.length !== beforeCount) {
        self.save((err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        });
      }
      else {
        logger.debug('liker not updated');
        return reject(new Error('Already unliked'));
      }
    }));
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

    const added = this.seenUsers.addToSet(userData._id);
    const saved = await this.save();

    debug('seenUsers updated!', added);
    pageEvent.emit('addSeenUsers', saved);

    return saved;
  };

  pageSchema.methods.updateSlackChannels = function(slackChannels) {
    this.slackChannels = slackChannels;

    return this.save();
  };

  pageSchema.methods.initLatestRevisionField = async function(revisionId) {
    this.latestRevision = this.revision;
    if (revisionId != null) {
      this.revision = revisionId;
    }
  };

  pageSchema.methods.populateDataToShowRevision = async function(shouldExcludeBody) {
    validateCrowi();

    const User = crowi.model('User');
    return populateDataToShowRevision(this, User.USER_FIELDS_EXCEPT_CONFIDENTIAL, shouldExcludeBody);
  };

  pageSchema.methods.populateDataToMakePresentation = async function(revisionId) {
    this.latestRevision = this.revision;
    if (revisionId != null) {
      this.revision = revisionId;
    }
    return this.populate('revision');
  };

  pageSchema.methods.applyScope = function(user, grant, grantUserGroupIds) {
    // Reset
    this.grantedUsers = [];
    this.grantedGroups = [];

    this.grant = grant || GRANT_PUBLIC;

    if (grant === GRANT_OWNER) {
      this.grantedUsers.push(user?._id ?? user);
    }

    if (grant === GRANT_USER_GROUP) {
      this.grantedGroups = grantUserGroupIds;
    }
  };

  pageSchema.methods.getContentAge = function() {
    return differenceInYears(new Date(), this.updatedAt);
  };


  pageSchema.statics.updateCommentCount = function(pageId) {
    validateCrowi();

    const self = this;
    const Comment = crowi.model('Comment');
    return Comment.countCommentByPageId(pageId)
      .then((count) => {
        self.update({ _id: pageId }, { commentCount: count }, {}, (err, data) => {
          if (err) {
            debug('Update commentCount Error', err);
            throw err;
          }

          return data;
        });
      });
  };

  pageSchema.statics.getDeletedPageName = function(path) {
    if (path.match('/')) {
      // eslint-disable-next-line no-param-reassign
      path = path.substr(1);
    }
    return `/trash/${path}`;
  };

  pageSchema.statics.getRevertDeletedPageName = function(path) {
    return path.replace('/trash', '');
  };

  pageSchema.statics.fixToCreatableName = function(path) {
    return path
      .replace(/\/\//g, '/');
  };

  pageSchema.statics.updateRevision = function(pageId, revisionId, cb) {
    this.update({ _id: pageId }, { revision: revisionId }, {}, (err, data) => {
      cb(err, data);
    });
  };

  /**
   * return whether the user is accessible to the page
   * @param {string} id ObjectId
   * @param {User} user
   */
  pageSchema.statics.isAccessiblePageByViewer = async function(id, user) {
    const baseQuery = this.count({ _id: id });

    const userGroups = user != null ? [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ] : [];

    const queryBuilder = new this.PageQueryBuilder(baseQuery);
    queryBuilder.addConditionToFilteringByViewer(user, userGroups, true);

    const count = await queryBuilder.query.exec();
    return count > 0;
  };

  /**
   * @param {string} id ObjectId
   * @param {User} user User instance
   * @param {UserGroup[]} userGroups List of UserGroup instances
   */
  pageSchema.statics.findByIdAndViewer = async function(id, user, userGroups, includeEmpty = false) {
    const baseQuery = this.findOne({ _id: id });

    const relatedUserGroups = (user != null && userGroups == null) ? [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ] : userGroups;

    const queryBuilder = new this.PageQueryBuilder(baseQuery, includeEmpty);
    queryBuilder.addConditionToFilteringByViewer(user, relatedUserGroups, true);

    return queryBuilder.query.exec();
  };

  // find page by path
  pageSchema.statics.findByPath = function(path, includeEmpty = false) {
    if (path == null) {
      return null;
    }

    const builder = new this.PageQueryBuilder(this.findOne({ path }), includeEmpty);

    return builder.query.exec();
  };

  /**
   * @param {string} path Page path
   * @param {User} user User instance
   * @param {UserGroup[]} userGroups List of UserGroup instances
   */
  pageSchema.statics.findAncestorByPathAndViewer = async function(path, user, userGroups, includeEmpty = false) {
    if (path == null) {
      throw new Error('path is required.');
    }

    if (path === '/') {
      return null;
    }

    const ancestorsPaths = extractToAncestorsPaths(path);

    // pick the longest one
    const baseQuery = this.findOne({ path: { $in: ancestorsPaths } }).sort({ path: -1 });

    const relatedUserGroups = (user != null && userGroups == null) ? [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ] : userGroups;

    const queryBuilder = new this.PageQueryBuilder(baseQuery, includeEmpty);
    queryBuilder.addConditionToFilteringByViewer(user, relatedUserGroups);

    return queryBuilder.query.exec();
  };

  /**
   * find pages that is match with `path` and its descendants
   */
  pageSchema.statics.findListWithDescendants = async function(path, user, option = {}, includeEmpty = false) {
    const builder = new this.PageQueryBuilder(this.find(), includeEmpty);
    builder.addConditionToListWithDescendants(path, option);

    return findListFromBuilderAndViewer(builder, user, false, option);
  };

  /**
   * find pages that is match with `path` and its descendants which user is able to manage
   */
  pageSchema.statics.findManageableListWithDescendants = async function(page, user, option = {}, includeEmpty = false) {
    if (user == null) {
      return null;
    }

    const builder = new this.PageQueryBuilder(this.find(), includeEmpty);
    builder.addConditionToListWithDescendants(page.path, option);

    // add grant conditions
    await addConditionToFilteringByViewerToEdit(builder, user);

    const { pages } = await findListFromBuilderAndViewer(builder, user, false, option);

    // add page if 'grant' is GRANT_RESTRICTED
    // because addConditionToListWithDescendants excludes GRANT_RESTRICTED pages
    if (page.grant === GRANT_RESTRICTED) {
      pages.push(page);
    }

    return pages;
  };

  /**
   * find pages that start with `path`
   */
  pageSchema.statics.findListByStartWith = async function(path, user, option, includeEmpty = false) {
    const builder = new this.PageQueryBuilder(this.find(), includeEmpty);
    builder.addConditionToListByStartWith(path, option);

    return findListFromBuilderAndViewer(builder, user, false, option);
  };

  /**
   * find pages that is created by targetUser
   *
   * @param {User} targetUser
   * @param {User} currentUser
   * @param {any} option
   */
  pageSchema.statics.findListByCreator = async function(targetUser, currentUser, option) {
    const opt = Object.assign({ sort: 'createdAt', desc: -1 }, option);
    const builder = new this.PageQueryBuilder(this.find({ creator: targetUser._id }));

    let showAnyoneKnowsLink = null;
    if (targetUser != null && currentUser != null) {
      showAnyoneKnowsLink = targetUser._id.equals(currentUser._id);
    }

    return await findListFromBuilderAndViewer(builder, currentUser, showAnyoneKnowsLink, opt);
  };

  /**
   * find pages by PageQueryBuilder
   * @param {PageQueryBuilder} builder
   * @param {User} user
   * @param {boolean} showAnyoneKnowsLink
   * @param {any} option
   */
  async function findListFromBuilderAndViewer(builder, user, showAnyoneKnowsLink, option) {
    validateCrowi();

    const User = crowi.model('User');
    const opt = Object.assign({ sort: 'updatedAt', desc: -1 }, option);
    const sortOpt = {};
    sortOpt[opt.sort] = opt.desc;

    // exclude trashed pages
    if (!opt.includeTrashed) {
      builder.addConditionToExcludeTrashed();
    }

    // add grant conditions
    await addConditionToFilteringByViewerForList(builder, user, showAnyoneKnowsLink);

    // count
    const totalCount = await builder.query.exec('count');

    // find
    builder.addConditionToPagenate(opt.offset, opt.limit, sortOpt);
    builder.populateDataToList(User.USER_FIELDS_EXCEPT_CONFIDENTIAL);
    const pages = await builder.query.lean().clone().exec('find');
    const result = {
      pages, totalCount, offset: opt.offset, limit: opt.limit,
    };
    return result;
  }

  /**
   * Add condition that filter pages by viewer
   *  by considering Config
   *
   * @param {PageQueryBuilder} builder
   * @param {User} user
   * @param {boolean} showAnyoneKnowsLink
   */
  async function addConditionToFilteringByViewerForList(builder, user, showAnyoneKnowsLink) {
    validateCrowi();

    // determine User condition
    const hidePagesRestrictedByOwner = crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner');
    const hidePagesRestrictedByGroup = crowi.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup');

    // determine UserGroup condition
    const userGroups = user != null ? [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ] : null;

    return builder.addConditionToFilteringByViewer(user, userGroups, showAnyoneKnowsLink, !hidePagesRestrictedByOwner, !hidePagesRestrictedByGroup);
  }

  /**
   * Add condition that filter pages by viewer
   *  by considering Config
   *
   * @param {PageQueryBuilder} builder
   * @param {User} user
   * @param {boolean} showAnyoneKnowsLink
   */
  async function addConditionToFilteringByViewerToEdit(builder, user) {
    // determine UserGroup condition
    const userGroups = user != null ? [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ] : null;

    return builder.addConditionToFilteringByViewer(user, userGroups, false, false, false);
  }

  /**
   * export addConditionToFilteringByViewerForList as static method
   */
  pageSchema.statics.addConditionToFilteringByViewerForList = addConditionToFilteringByViewerForList;

  /**
   * export addConditionToFilteringByViewerToEdit as static method
   */
  pageSchema.statics.addConditionToFilteringByViewerToEdit = addConditionToFilteringByViewerToEdit;

  /**
   * Throw error for growi-lsx-plugin (v1.x)
   */
  pageSchema.statics.generateQueryToListByStartWith = function(path, user, option) {
    const dummyQuery = this.find();
    dummyQuery.exec = async() => {
      throw new Error('Plugin version mismatch. Upgrade growi-lsx-plugin to v2.0.0 or above.');
    };
    return dummyQuery;
  };
  pageSchema.statics.generateQueryToListWithDescendants = pageSchema.statics.generateQueryToListByStartWith;


  /**
   * find all templates applicable to the new page
   */
  pageSchema.statics.findTemplate = async function(path) {
    const templatePath = nodePath.posix.dirname(path);
    const pathList = generatePathsOnTree(path, []);
    const regexpList = pathList.map((path) => {
      const pathWithTrailingSlash = pathUtils.addTrailingSlash(path);
      return new RegExp(`^${escapeStringRegexp(pathWithTrailingSlash)}_{1,2}template$`);
    });

    const templatePages = await this.find({ path: { $in: regexpList } })
      .populate({ path: 'revision', model: 'Revision' })
      .exec();

    return fetchTemplate(templatePages, templatePath);
  };

  const generatePathsOnTree = (path, pathList) => {
    pathList.push(path);

    if (path === '/') {
      return pathList;
    }

    const newPath = nodePath.posix.dirname(path);

    return generatePathsOnTree(newPath, pathList);
  };

  const assignTemplateByType = (templates, path, type) => {
    const targetTemplatePath = urljoin(path, `${type}template`);

    return templates.find((template) => {
      return (template.path === targetTemplatePath);
    });
  };

  const assignDecendantsTemplate = (decendantsTemplates, path) => {
    const decendantsTemplate = assignTemplateByType(decendantsTemplates, path, '__');
    if (decendantsTemplate) {
      return decendantsTemplate;
    }

    if (path === '/') {
      return;
    }

    const newPath = nodePath.posix.dirname(path);
    return assignDecendantsTemplate(decendantsTemplates, newPath);
  };

  const fetchTemplate = async(templates, templatePath) => {
    let templateBody;
    let templateTags;
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
      templateBody = childrenTemplate.revision.body;
      templateTags = await childrenTemplate.findRelatedTagsById();
    }
    else if (decendantsTemplate) {
      templateBody = decendantsTemplate.revision.body;
      templateTags = await decendantsTemplate.findRelatedTagsById();
    }

    return { templateBody, templateTags };
  };

  pageSchema.statics.applyScopesToDescendantsAsyncronously = async function(parentPage, user, isV4 = false) {
    const builder = new this.PageQueryBuilder(this.find());
    builder.addConditionToListOnlyDescendants(parentPage.path);

    if (isV4) {
      builder.addConditionAsRootOrNotOnTree();
    }
    else {
      builder.addConditionAsOnTree();
    }

    // add grant conditions
    await addConditionToFilteringByViewerToEdit(builder, user);

    const grant = parentPage.grant;

    await builder.query.updateMany({}, {
      grant,
      grantedGroups: grant === PageGrant.GRANT_USER_GROUP ? parentPage.grantedGroups : null,
      grantedUsers: grant === PageGrant.GRANT_OWNER ? [user._id] : null,
    });

  };

  pageSchema.statics.findListByPathsArray = async function(paths, includeEmpty = false) {
    const queryBuilder = new this.PageQueryBuilder(this.find(), includeEmpty);
    queryBuilder.addConditionToListByPathsArray(paths);

    return await queryBuilder.query.exec();
  };

  pageSchema.statics.publicizePages = async function(pages) {
    const operationsToPublicize = pages.map((page) => {
      return {
        updateOne: {
          filter: { _id: page._id },
          update: {
            grantedGroups: null,
            grant: this.GRANT_PUBLIC,
          },
        },
      };
    });
    await this.bulkWrite(operationsToPublicize);
  };

  /**
   * transfer pages grant to specified user group
   * @param {Page[]} pages
   * @param {IGrantedGroup} transferToUserGroup
   */
  pageSchema.statics.transferPagesToGroup = async function(pages, transferToUserGroup) {
    const userGroupModel = transferToUserGroup.type === GroupType.userGroup ? UserGroup : ExternalUserGroup;

    if ((await userGroupModel.count({ _id: transferToUserGroup.item })) === 0) {
      throw Error('Cannot find the group to which private pages belong to. _id: ', transferToUserGroup.item);
    }

    await this.updateMany({ _id: { $in: pages.map(p => p._id) } }, { grantedGroups: [transferToUserGroup] });
  };

  /**
   * associate GROWI page and HackMD page
   * @param {Page} pageData
   * @param {string} pageIdOnHackmd
   */
  pageSchema.statics.registerHackmdPage = function(pageData, pageIdOnHackmd) {
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

  pageSchema.methods.getNotificationTargetUsers = async function() {
    const Comment = mongoose.model('Comment');
    const Revision = mongoose.model('Revision');

    const [commentCreators, revisionAuthors] = await Promise.all([Comment.findCreatorsByPage(this), Revision.findAuthorsByPage(this)]);

    const targetUsers = new Set([this.creator].concat(commentCreators, revisionAuthors));
    return Array.from(targetUsers);
  };

  pageSchema.statics.getHistories = function() {
    // TODO

  };

  pageSchema.statics.STATUS_PUBLISHED = STATUS_PUBLISHED;
  pageSchema.statics.STATUS_DELETED = STATUS_DELETED;
  pageSchema.statics.GRANT_PUBLIC = GRANT_PUBLIC;
  pageSchema.statics.GRANT_RESTRICTED = GRANT_RESTRICTED;
  pageSchema.statics.GRANT_SPECIFIED = GRANT_SPECIFIED;
  pageSchema.statics.GRANT_OWNER = GRANT_OWNER;
  pageSchema.statics.GRANT_USER_GROUP = GRANT_USER_GROUP;
  pageSchema.statics.PAGE_GRANT_ERROR = PAGE_GRANT_ERROR;

  return pageSchema;
};
