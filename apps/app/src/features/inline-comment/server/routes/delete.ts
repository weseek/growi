/**
 * DELETE /_api/v3/inline-comments/:id — origin comment delete (cascades to
 * its replies).
 *
 * Middleware order (design.md's API Contract, matching update.ts/resolve.ts):
 *   accessTokenParser → loginRequired → excludeReadOnlyUserIfCommentNotAllowed
 *   → express-validator → apiV3FormValidator
 *
 * `excludeReadOnlyUserIfCommentNotAllowed` (requirements.md Requirement 18,
 * AC 18.8/18.9) is the same middleware normal comments use for
 * `/comments.remove` (`apps/app/src/server/routes/index.js`), placed right
 * after `loginRequired` — this is what makes the read-only-user restriction
 * a server-side guarantee rather than only a client-side affordance
 * (`NotAvailableIfReadOnlyUserNotAllowedToComment` gates the client's delete
 * button, but a direct API call could otherwise bypass it entirely).
 *
 * `certifySharedPage` is intentionally NOT applied (requirement 6.1, same as
 * every other inline-comment route). `addActivity` is also intentionally NOT
 * applied — `InlineCommentService.deleteComment()` self-mints its own
 * Activity id via `prisma.activities.createByParameters`, same reasoning as
 * update.ts's file doc.
 *
 * No request body DTO (`id` is a URL param) and no meaningful response
 * payload — success returns `res.apiv3({})`, the same minimal-response idea
 * as `/comments.remove` (design.md's New Files note: delete routes
 * intentionally have no DTO file).
 *
 * `:id` / 400-vs-403-vs-404 split (design.md's Error Handling): a
 * `findUnique` distinguishes "id does not exist" (404), "id exists but is
 * not an origin inline comment" (400, mirroring update.ts's
 * `inline-comment-not-origin`), and "id is an origin comment but the
 * requester is not its creator" (403 `inline-comment-forbidden`). This route
 * performs the creatorId check itself (rather than only relying on
 * `InlineCommentService.deleteComment()`'s own re-check) so it can surface
 * the 403 distinctly — the service only throws a single generic Error for
 * every precondition failure, which this route would otherwise be unable to
 * map to a specific status code.
 *
 * `InlineCommentService.deleteComment()` (already implemented in task 1) is
 * not modified here — it internally calls `prisma.comments.removeWithReplies`,
 * which cascades the delete to every reply (requirement 18.6).
 */

import assert from 'node:assert';
import type { IUser } from '@growi/core';
import { isIPageNotFoundInfo, SCOPE } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { param } from 'express-validator';
import type { HydratedDocument } from 'mongoose';

import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { excludeReadOnlyUserIfCommentNotAllowed } from '~/server/middlewares/exclude-read-only-user';
import loginRequiredFactory from '~/server/middlewares/login-required';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { findPageAndMetaDataByViewer } from '~/server/service/page/find-page-and-meta-data-by-viewer';
import loggerFactory from '~/utils/logger';
import { prisma } from '~/utils/prisma';

import { InlineCommentService } from '../service/inline-comment-service';

const logger = loggerFactory('growi:routes:apiv3:inline-comments:delete');

type Req = Request<{ id: string }, ApiV3Response> & {
  user?: HydratedDocument<IUser>;
};

const validator = [
  param('id').isMongoId().withMessage('id must be a valid MongoId'),
];

/**
 * Factory function that wires the origin inline-comment delete route.
 *
 * @returns Express RequestHandler array to be spread into router.delete().
 */
export const deleteInlineCommentRouteHandlersFactory = (
  crowi: Crowi,
): RequestHandler[] => {
  const loginRequired = loginRequiredFactory(crowi, false);
  const { pageService, pageGrantService } = crowi;

  return [
    accessTokenParser([SCOPE.WRITE.FEATURES.PAGE], { acceptLegacy: true }),
    loginRequired,
    excludeReadOnlyUserIfCommentNotAllowed,
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
      // existence-oracle reasoning as update.ts's equivalent comment (see
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
        await service.deleteComment(id, user._id.toString());
        return res.apiv3({});
      } catch (err) {
        // The preconditions (shape, ownership) were already checked above, so
        // an Error here can only come from a race — see update.ts's
        // equivalent comment.
        logger.error('Failed to delete inline comment', err);
        return res.apiv3Err(
          new ErrorV3(
            err instanceof Error
              ? err.message
              : 'Failed to delete inline comment',
            'inline-comment-delete-failed',
          ),
          400,
        );
      }
    },
  ];
};
