import express from 'express';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { configManager } from '~/server/service/config-manager';
import ApiResponse from '~/server/util/apiResponse';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:admin:attachments');

export const PREDEFINED_INLINE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-icon',
  'application/pdf',
  'video/mp4',
  'audio/mpeg',
  'text/plain',
] as const;

const DANGEROUS_MIME_TYPES = new Set([
  'text/html',
  'application/javascript',
  'application/x-javascript',
  'image/svg+xml',
  'application/x-shockwave-flash',
]);

// Assign the router factory function to a variable before exporting
const adminAttachmentsRouterFactory = (crowi: any) => {
  const router = express.Router();

  /**
   * @swagger
   * /admin/attachments/inline-allowlist:
   * get:
   * tags: [Attachments, Admin]
   * summary: Get inline display allowlist settings
   * description: Retrieve the current inline display allowlist for attachment MIME types.
   * responses:
   * 200:
   * description: Successfully retrieved settings.
   * content:
   * application/json:
   * schema:
   * properties:
   * inlineAllowlistTypes:
   * type: array
   * items:
   * type: string
   * description: List of allowed MIME types for inline display.
   * customInlineAllowlistTypes:
   * type: string
   * description: Comma-separated string of custom allowed MIME types.
   * 500:
   * description: Server error.
   */
  router.get('/inline-allowlist', (req: Request, res: Response) => {
    try {
      const inlineAllowlistTypes = configManager.getConfig('security:inlineAllowlistTypes') || [];
      const customInlineAllowlistTypes = configManager.getConfig('security:customInlineAllowlistTypes') || '';
      return res.json(ApiResponse.success({ inlineAllowlistTypes, customInlineAllowlistTypes }));
    } catch (err) {
      logger.error('Failed to retrieve inline allowlist settings', err);
      return res.json(ApiResponse.error('Failed to retrieve settings.'));
    }
  });

  /**
   * @swagger
   * /admin/attachments/inline-allowlist:
   * put:
   * tags: [Attachments, Admin]
   * summary: Update inline display allowlist settings
   * description: Update the inline display allowlist for attachment MIME types.
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * inlineAllowlistTypes:
   * type: array
   * items:
   * type: string
   * description: List of selected predefined MIME types.
   * customInlineAllowlistTypes:
   * type: string
   * description: Comma-separated string of custom MIME types.
   * responses:
   * 200:
   * description: Successfully updated settings.
   * content:
   * application/json:
   * schema:
   * properties:
   * updatedConfig:
   * type: object
   * properties:
   * inlineAllowlistTypes:
   * type: array
   * items:
   * type: string
   * customInlineAllowlistTypes:
   * type: string
   * 400:
   * description: Invalid request body.
   * 500:
   * description: Server error.
   */
  router.put('/inline-allowlist', [
    body('inlineAllowlistTypes').isArray().withMessage('inlineAllowlistTypes must be an array'),
    body('inlineAllowlistTypes.*').isString().withMessage('inlineAllowlistTypes elements must be strings'),
    body('customInlineAllowlistTypes').isString().withMessage('customInlineAllowlistTypes must be a string'),
  ], async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse.error(errors.array().map(e => e.msg).join(', ')));
    }

    const { inlineAllowlistTypes, customInlineAllowlistTypes } = req.body;

    const validPredefinedTypes = (Array.isArray(inlineAllowlistTypes) ? inlineAllowlistTypes : [])
      .filter((type: string) => typeof type === 'string' && PREDEFINED_INLINE_MIME_TYPES.includes(type as (typeof PREDEFINED_INLINE_MIME_TYPES)[number]));

    const sanitizedCustomTypesArray = (typeof customInlineAllowlistTypes === 'string' ? customInlineAllowlistTypes : '')
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0 && !DANGEROUS_MIME_TYPES.has(type));

    const combinedAllowlist = Array.from(new Set([
      ...validPredefinedTypes,
      ...sanitizedCustomTypesArray,
    ]));

    try {
      await configManager.updateConfigs({
        'security:inlineAllowlistTypes': combinedAllowlist,
        'security:customInlineAllowlistTypes': sanitizedCustomTypesArray.join(','),
      });

      const updatedConfig = {
        inlineAllowlistTypes: combinedAllowlist,
        customInlineAllowlistTypes: sanitizedCustomTypesArray.join(','),
      };

      return res.json(ApiResponse.success({ updatedConfig }));
    } catch (err) {
      logger.error('Failed to update inline allowlist settings', err);
      return res.json(ApiResponse.error('Failed to update settings.'));
    }
  });

  return router;
};

// Export the variable as the default module export
export default adminAttachmentsRouterFactory;
