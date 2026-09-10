/**
 * PUT /_api/v3/inline-comments/:id — origin comment body edit.
 *
 * Middleware order (design.md's API Contract, matching resolve.ts):
 *   accessTokenParser → loginRequired → express-validator → apiV3FormValidator
 *
 * `certifySharedPage` is intentionally NOT applied (requirement 6.1, same as
 * every other inline-comment route). `addActivity` is also intentionally NOT
 * applied — `InlineCommentService.updateComment()` self-mints its own
 * Activity id via `prisma.activities.createByParameters`, same reasoning as
 * create.ts's file doc.
 *
 * `:id` / 400-vs-403-vs-404 split (design.md's Error Handling): a `findUnique`
 * distinguishes "id does not exist" (404), "id exists but is not an origin
 * inline comment" (400, mirroring resolve.ts's `inline-comment-not-origin`),
 * and "id is an origin comment but the requester is not its creator" (403
 * `inline-comment-forbidden`, a new error code named after
 * `inline-comment-not-origin`'s convention). This route performs the
 * creatorId check itself (rather than only relying on
 * `InlineCommentService.updateComment()`'s own re-check) so it can surface
 * the 403 distinctly — the service only throws a single generic Error for
 * every precondition failure, which this route would otherwise be unable to
 * map to a specific status code.
 */

import assert from 'node:assert';
import type { IUser } from '@growi/core';
import { isIPageNotFoundInfo, SCOPE } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { body, param } from 'express-validator';
import type { HydratedDocument } from 'mongoose';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import loginRequiredFactory from '~/server/middlewares/login-required';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { findPageAndMetaDataByViewer } from '~/server/service/page/find-page-and-meta-data-by-viewer';
import loggerFactory from '~/utils/logger';
import { prisma } from '~/utils/prisma';

import type { UpdateInlineCommentRequestBody } from '../../interfaces/dto/update-inline-comment';
import { InlineCommentService } from '../service/inline-comment-service';

const logger = loggerFactory('growi:routes:apiv3:inline-comments:update');

type Req = Request<
  { id: string },
  ApiV3Response,
  UpdateInlineCommentRequestBody
> & {
  user?: HydratedDocument<IUser>;
};

const validator = [
  param('id').isMongoId().withMessage('id must be a valid MongoId'),
  body('comment')
    .isString()
    .notEmpty()
    .withMessage('comment must be a non-empty string'),
];

/**
 * Factory function that wires the origin inline-comment update route.
 *
 * @returns Express RequestHandler array to be spread into router.put().
 */
export const updateInlineCommentRouteHandlersFactory = (
  crowi: Crowi,
): RequestHandler[] => {
  const loginRequired = loginRequiredFactory(crowi, false);
  const { pageService, pageGrantService } = crowi;

  return [
    accessTokenParser([SCOPE.WRITE.FEATURES.PAGE], { acceptLegacy: true }),
    loginRequired,
    ...validator,
    apiV3FormValidator,
    async (req: Req, res: ApiV3Response) => {
      const { user } = req;
      assert(
        user != null,
        'user is required (ensured by loginRequired middleware)',
      );
      assert(
        crowi.commentService != null,
        'commentService must be initialized',
      );

      const id = req.params.id;
      const { comment } = req.body;

      const target = await prisma.comments.findUnique({
        where: { id },
        select: {
          pageId: true,
          isInline: true,
          replyToId: true,
          creatorId: true,
        },
      });

      // Page-permission check runs before the comment-existence/shape/owner
      // checks below, whenever a pageId is known (i.e. `id` exists) — same
      // existence-oracle reasoning as resolve.ts's equivalent comment (see
      // apps/app/.claude/rules/page-write-action-403-404.md). When `id` does
      // not exist at all, there is no pageId to check permission against, so
      // this falls through to the not-found branch below unconditionally.
      if (target != null) {
        const { meta } = await findPageAndMetaDataByViewer(
          pageService,
          pageGrantService,
          { pageId: target.pageId, path: null, user, basicOnly: true },
        );
        if (isIPageNotFoundInfo(meta)) {
          return res.apiv3Err(
            new ErrorV3(
              'Page is not found or forbidden',
              'notfound_or_forbidden',
            ),
            404,
          );
        }
      }

      if (target == null) {
        return res.apiv3Err(
          new ErrorV3(
            `Inline comment '${id}' is not found`,
            'inline-comment-not-found',
          ),
          404,
        );
      }

      if (!target.isInline || target.replyToId != null) {
        return res.apiv3Err(
          new ErrorV3(
            `Inline comment '${id}' is not an origin inline comment`,
            'inline-comment-not-origin',
          ),
          400,
        );
      }

      if (target.creatorId !== user._id.toString()) {
        return res.apiv3Err(
          new ErrorV3(
            `Inline comment '${id}' is not owned by the requester`,
            'inline-comment-forbidden',
          ),
          403,
        );
      }

      const service = new InlineCommentService({
        prisma,
        commentService: crowi.commentService,
      });

      try {
        const inlineComment = await service.updateComment(
          id,
          comment,
          user._id.toString(),
        );
        return res.apiv3({ inlineComment });
      } catch (err) {
        // The preconditions (shape, ownership) were already checked above, so
        // an Error here can only come from a race — see resolve.ts's
        // equivalent comment.
        logger.error('Failed to update inline comment', err);
        return res.apiv3Err(
          new ErrorV3(
            err instanceof Error
              ? err.message
              : 'Failed to update inline comment',
            'inline-comment-update-failed',
          ),
          400,
        );
      }
    },
  ];
};
