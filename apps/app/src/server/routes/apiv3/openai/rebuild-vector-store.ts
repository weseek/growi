import { ErrorV3 } from '@growi/core/dist/models';
import type { Request, RequestHandler } from 'express';
import type { ValidationChain } from 'express-validator';

import type Crowi from '~/server/crowi';
import { certifyAiService } from '~/server/middlewares/certify-ai-service';
import { configManager } from '~/server/service/config-manager';
import OpenaiClient from '~/server/service/openai-client-delegator';
import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../../middlewares/apiv3-form-validator';
import type { ApiV3Response } from '../interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:openai:rebuild-vector-store');

type RebuildVectorStoreFactory = (crowi: Crowi) => RequestHandler[];

export const rebuildVectorStoreHandlersFactory: RebuildVectorStoreFactory = (crowi) => {
  const accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);

  const validator: ValidationChain[] = [
    //
  ];

  return [
    accessTokenParser, loginRequiredStrictly, adminRequired, certifyAiService, validator, apiV3FormValidator,
    async(req: Request, res: ApiV3Response) => {

      try {
        const client = new OpenaiClient();

        // Delete an existing VectorStoreFile
        const vectorStoreFileData = await client.getVectorStoreFiles();
        const vectorStoreFiles = vectorStoreFileData?.data;
        if (vectorStoreFiles != null && vectorStoreFiles.length > 0) {
          vectorStoreFiles.forEach(async(vectorStoreFile) => {
            await client.deleteVectorStoreFiles(vectorStoreFile.id);
          });
        }

        // Create all public pages VectorStoreFile
        // TODO: https://redmine.weseek.co.jp/issues/153988

        return res.apiv3({});

      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(new ErrorV3('Vector Store rebuild failed'));
      }
    },
  ];
};
