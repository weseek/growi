import type { IPage, IUser } from '@growi/core';
import { type IAttachment } from '@growi/core';
import { OptionParser } from '@growi/core/dist/remark-plugins';
import type { Request } from 'express';
import { Router } from 'express';
import type { Model, HydratedDocument } from 'mongoose';
import mongoose, { model, Types } from 'mongoose';

import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:remark-attachment-refs:routes:refs');


type RequestWithUser = Request & { user: HydratedDocument<IUser> };


const loginRequiredFallback = (req, res) => {
  return res.status(403).send('login required');
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const routesFactory = (crowi): any => {

  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  const { serializeUserSecurely } = crowi.require('../models/serializers/user-serializer');

  const router = Router();

  const ObjectId = Types.ObjectId;

  const User = mongoose.model('User');
  const Page = mongoose.model <HydratedDocument<IPage>, Model<any> & any>('Page');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { PageQueryBuilder } = Page as any;

  function generateRegexp(expression: string): RegExp {
    // https://regex101.com/r/uOrwqt/2
    const matches = expression.match(/^\/(.+)\/(.*)?$/);

    return (matches != null)
      ? new RegExp(matches[1], matches[2])
      : new RegExp(expression);
  }

  /**
   * add depth condition that limit fetched pages
   *
   * @param {any} query
   * @param {any} pagePath
   * @param {any} optionsDepth
   * @returns query
   */
  function addDepthCondition(query, pagePath, optionsDepth) {
    // when option strings is 'depth=', the option value is true
    if (optionsDepth == null || optionsDepth === true) {
      throw new Error('The value of depth option is invalid.');
    }

    const range = OptionParser.parseRange(optionsDepth);

    if (range == null) {
      return query;
    }

    const start = range.start;
    const end = range.end;

    if (start < 1 || end < 1) {
      throw new Error(`specified depth is [${start}:${end}] : start and end are must be larger than 1`);
    }

    // count slash
    const slashNum = pagePath.split('/').length - 1;
    const depthStart = slashNum; // start is not affect to fetch page
    const depthEnd = slashNum + end - 1;

    return query.and({
      path: new RegExp(`^(\\/[^\\/]*){${depthStart},${depthEnd}}$`),
    });
  }

  /**
   * return an Attachment model
   */
  router.get('/ref', accessTokenParser, loginRequired, async(req: RequestWithUser, res) => {
    const user = req.user;
    const { pagePath, fileNameOrId } = req.query;

    if (pagePath == null) {
      res.status(400).send('the param \'pagePath\' must be set.');
      return;
    }

    const page = await Page.findByPathAndViewer(pagePath, user, undefined, true);

    // not found
    if (page == null) {
      res.status(404).send(`pagePath: '${pagePath}' is not found or forbidden.`);
      return;
    }

    // convert ObjectId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orConditions: any[] = [{ originalName: fileNameOrId }];
    if (fileNameOrId != null && ObjectId.isValid(fileNameOrId.toString())) {
      orConditions.push({ _id: new ObjectId(fileNameOrId.toString()) });
    }

    const Attachment = model<IAttachment>('Attachment');
    const attachment = await Attachment
      .findOne({
        page: page._id,
        $or: orConditions,
      })
      .populate('creator');

    // not found
    if (attachment == null) {
      res.status(404).send(`attachment '${fileNameOrId}' is not found.`);
      return;
    }

    logger.debug(`attachment '${attachment.id}' is found from fileNameOrId '${fileNameOrId}'`);

    // forbidden
    const isAccessible = await Page.isAccessiblePageByViewer(attachment.page, user);
    if (!isAccessible) {
      logger.debug(`attachment '${attachment.id}' is forbidden for user '${user && user.username}'`);
      res.status(403).send(`page '${attachment.page}' is forbidden.`);
      return;
    }

    // serialize User data
    attachment.creator = serializeUserSecurely(attachment.creator);

    res.status(200).send({ attachment });
  });

  /**
   * return a list of Attachment
   */
  router.get('/refs', accessTokenParser, loginRequired, async(req: RequestWithUser, res) => {
    const user = req.user;
    const { prefix, pagePath } = req.query;
    const options = JSON.parse(req.query.options?.toString() ?? '');

    // check either 'prefix' or 'pagePath ' is specified
    if (prefix == null && pagePath == null) {
      res.status(400).send('either the param \'prefix\' or \'pagePath\' must be set.');
      return;
    }

    // check regex
    let regex;
    const regexOptionValue = options.regexp || options.regex;
    if (regexOptionValue != null) {
      try {
        regex = generateRegexp(regexOptionValue);
      }
      catch (err) {
        res.status(400).send(`the 'regex=${options.regex}' option is invalid as RegExp.`);
        return;
      }
    }

    let builder;

    // builder to retrieve descendance
    if (prefix != null) {
      builder = new PageQueryBuilder(Page.find())
        .addConditionToListWithDescendants(prefix)
        .addConditionToExcludeTrashed();
    }
    // builder to get single page
    else {
      builder = new PageQueryBuilder(Page.find({ path: pagePath }));
    }

    Page.addConditionToFilteringByViewerForList(builder, user, false);

    let pageQuery = builder.query;

    // depth
    try {
      if (prefix != null && options.depth != null) {
        pageQuery = addDepthCondition(pageQuery, prefix, options.depth);
      }
    }
    catch (err) {
      return res.status(400).send(err);
    }

    const results = await pageQuery.select('id').exec();
    const pageIds = results.map(result => result.id);

    logger.debug('retrieve attachments for pages:', pageIds);

    // create query to find
    const Attachment = model<IAttachment>('Attachment');
    let query = Attachment
      .find({
        page: { $in: pageIds },
      });
    // add regex condition
    if (regex != null) {
      query = query.and([
        { originalName: { $regex: regex } },
      ]);
    }

    const attachments = await query
      .populate('creator')
      .exec();

    // serialize User data
    attachments.forEach((doc) => {
      if (doc.creator != null && doc.creator instanceof User) {
        doc.creator = serializeUserSecurely(doc.creator);
      }
    });

    res.status(200).send({ attachments });
  });

  return router;
};
