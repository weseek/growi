import type { IUser } from '@growi/core';
import { isIPageNotFoundInfo, SCOPE } from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import { body, param } from 'express-validator';
import type { HydratedDocument } from 'mongoose';

import { notFoundOrForbidden } from '~/features/comment/server/routes/not-found-or-forbidden';
import type Crowi from '~/server/crowi';
import { accessTokenParser } from '~/server/middlewares/access-token-parser';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { excludeReadOnlyUserIfCommentNotAllowed } from '~/server/middlewares/exclude-read-only-user';
import loginRequiredFactory from '~/server/middlewares/login-required';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import { findPageAndMetaDataByViewer } from '~/server/service/page/find-page-and-meta-data-by-viewer';
import loggerFactory from '~/utils/logger';
import { prisma } from '~/utils/prisma';

import type { UpdateCommentReactionRequestBody } from '../../dto';
import { normalizeReactionKey } from '../../utils';

const logger = loggerFactory('growi:routes:apiv3:comments:reactions:update');

const MAX_EMOJI_LENGTH = 64;

type Req = Request<
  { id: string },
  ApiV3Response,
  UpdateCommentReactionRequestBody
> & {
  user?: HydratedDocument<IUser>;
};

/**
 * @swagger
 *
 *    /comments/{id}/reactions:
 *      put:
 *        tags: [Comments]
 *        summary: Add or remove the requester's reaction on a comment
 *        description: >
 *          Adds (`isReacted: true`) or removes (`isReacted: false`) the
 *          requester's reaction with `emoji` on the comment. The request is
 *          idempotent: repeating it leaves the same state and answers
 *          `changed: false`. Regular and inline comments (and replies to
 *          either) can be reacted to. Only a logged-in user who can view the
 *          comment's page may react; share links do not grant it. A read-only
 *          user may react only while read-only users are allowed to comment.
 *          Authentication with an access token requires the scope
 *          `write:features:page`.
 *        parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: ID of the comment.
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - emoji
 *                  - isReacted
 *                properties:
 *                  emoji:
 *                    type: string
 *                    maxLength: 64
 *                    description: >
 *                      Reaction key: `unicode:` followed by the emoji shortcode,
 *                      optionally with a skin tone suffix `::skin-tone-2` to
 *                      `::skin-tone-6` (e.g. `unicode:+1`,
 *                      `unicode:+1::skin-tone-3`). Aliases (e.g.
 *                      `unicode:thumbsup`) are accepted and stored as the
 *                      canonical shortcode.
 *                  isReacted:
 *                    type: boolean
 *                    description: true to add the reaction, false to remove it.
 *        responses:
 *          200:
 *            description: The reaction is in the requested state.
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  required:
 *                    - changed
 *                    - comment
 *                  properties:
 *                    changed:
 *                      type: boolean
 *                      description: false when the reaction was already in the requested state.
 *                    comment:
 *                      $ref: '#/components/schemas/CommentListItem'
 *          400:
 *            description: >
 *              A parameter is missing or malformed, or the requester is a
 *              read-only user who may not comment (error code
 *              `validation_failed`); or `emoji` is not a usable reaction, such
 *              as an unknown emoji or a skin tone on an emoji without skin
 *              tones (error code `invalid-reaction-emoji`).
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorV3'
 *          403:
 *            description: Not authenticated, or the access token lacks the required scope.
 *          404:
 *            description: >
 *              The comment does not exist, or the caller may not view its page.
 *              These cases are deliberately indistinguishable (error code
 *              `notfound_or_forbidden`).
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorV3'
 *          409:
 *            description: >
 *              Adding a new kind of emoji would exceed the number of kinds a
 *              comment can have (error code `reaction-kind-limit-exceeded`).
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorV3'
 *          500:
 *            description: Unexpected failure (error code `comment-reaction-update-failed`).
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ErrorV3'
 */
export const updateCommentReactionRouteHandlersFactory = (
  crowi: Crowi,
): RequestHandler[] => {
  const loginRequired = loginRequiredFactory(crowi, false);
  const addActivity = generateAddActivityMiddleware();
  const { pageService, pageGrantService } = crowi;

  const validator = [
    param('id').isMongoId(),
    body('emoji').isString().bail().isLength({ max: MAX_EMOJI_LENGTH }),
    body('isReacted').isBoolean({ strict: true }),
  ];

  // Order per rules/activity-recording.md (Rule 2).
  return [
    accessTokenParser([SCOPE.WRITE.FEATURES.PAGE], { acceptLegacy: true }),
    loginRequired,
    excludeReadOnlyUserIfCommentNotAllowed,
    addActivity,
    ...validator,
    apiV3FormValidator,
    async (req: Req, res: ApiV3Response) => {
      try {
        const target = await prisma.comments.findUnique({
          where: { id: req.params.id },
          select: { id: true, pageId: true },
        });
        if (target == null) {
          return res.apiv3Err(notFoundOrForbidden(), 404);
        }

        // The page check runs before the emoji check, so an invalid emoji
        // cannot tell a forbidden comment from a missing one.
        const { meta } = await findPageAndMetaDataByViewer(
          pageService,
          pageGrantService,
          {
            pageId: target.pageId,
            path: null,
            user: req.user,
            basicOnly: true,
          },
        );
        if (isIPageNotFoundInfo(meta)) {
          return res.apiv3Err(notFoundOrForbidden(), 404);
        }

        const emoji = normalizeReactionKey(req.body.emoji);
        if (!emoji.ok) {
          return res.apiv3Err(
            new ErrorV3(
              'Emoji is not a usable reaction',
              'invalid-reaction-emoji',
            ),
            400,
          );
        }

        return res.apiv3Err(
          new ErrorV3(
            'Updating a reaction is not available',
            'comment-reaction-update-unavailable',
          ),
          501,
        );
      } catch (err) {
        logger.error('Failed to update comment reaction', err);
        return res.apiv3Err(
          new ErrorV3(
            'Failed to update comment reaction',
            'comment-reaction-update-failed',
          ),
          500,
        );
      }
    },
  ];
};
