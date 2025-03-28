import { ErrorV3 } from '@growi/core/dist/models';
import express from 'express';

import type Crowi from '~/server/crowi';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';

import { isAiEnabled } from '../services';

const router = express.Router();

/**
 * @swagger
 *   components:
 *     schemas:
 *       OpenAIThread:
 *         type: object
 *         properties:
 *           userId:
 *             type: string
 *           aiAssistant:
 *             type: string
 *           threadId:
 *             type: string
 *           title:
 *             type: string
 *           _id:
 *             type: string
 *           expiredAt:
 *             type: string
 *           __v:
 *             type: number
 *       OpenAIMessagesResponse:
 *         type: object
 *         properties:
 *           messages:
 *             type: object
 *             properties:
 *               options:
 *                 type: object
 *                 properties:
 *                   method:
 *                     type: string
 *                   path:
 *                     type: string
 *                   query:
 *                     type: object
 *                     properties:
 *                       order:
 *                         type: string
 *                   headers:
 *                     type: object
 *                     properties:
 *                       OpenAI-Beta:
 *                         type: string
 *           response:
 *             type: object
 *             properties:
 *               size:
 *                 type: integer
 *               timeout:
 *                 type: integer
 *           body:
 *             type: object
 *             properties:
 *               object:
 *                 type: string
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OpenAIMessage'
 *               first_id:
 *                 type: string
 *               last_id:
 *                 type: string
 *               has_more:
 *                 type: boolean
 *       OpenAIMessage:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *           object:
 *             type: string
 *           created_at:
 *             type: integer
 *           assistant_id:
 *             type: string
 *             nullable: true
 *           thread_id:
 *             type: string
 *           run_id:
 *             type: string
 *             nullable: true
 *           role:
 *             type: string
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/OpenAIMessageContent'
 *           attachments:
 *             type: array
 *             items:
 *               type: object
 *           metadata:
 *             type: object
 *       OpenAIMessageContent:
 *         type: object
 *         properties:
 *           type:
 *             type: string
 *           text:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               annotations:
 *                 type: array
 *                 items:
 *                   type: object
 *       OpenAIAssistant:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           description:
 *             type: string
 *           additionalInstruction:
 *             type: string
 *           pagePathPatterns:
 *             type: array
 *             items:
 *               type: string
 *           vectorStore:
 *             type: object
 *             properties:
 *               vectorStoreId:
 *                 type: string
 *               isDeleted:
 *                 type: boolean
 *               _id:
 *                 type: string
 *               __v:
 *                 type: integer
 *           owner:
 *             type: string
 *           shareScope:
 *             type: string
 *           accessScope:
 *             type: string
 *           isDefault:
 *             type: boolean
 *           _id:
 *             type: string
 *           grantedGroupsForShareScope:
 *             type: array
 *             items:
 *               type: string
 *           grantedGroupsForAccessScope:
 *             type: array
 *             items:
 *               type: string
 *           createdAt:
 *             type: string
 *           updatedAt:
 *             type: string
 *           __v:
 *             type: integer
 *       UpdateOpenAIAssistantParams:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           description:
 *             type: string
 *           additionalInstruction:
 *             type: string
 *           pagePathPatterns:
 *             type: array
 *             items:
 *               type: string
 *           shareScope:
 *             type: string
 *           accessScope:
 *             type: string
 *           isDefault:
 *             type: boolean
 */
export const factory = (crowi: Crowi): express.Router => {

  // disable all routes if AI is not enabled
  if (!isAiEnabled()) {
    router.all('*', (req, res: ApiV3Response) => {
      return res.apiv3Err(new ErrorV3('GROWI AI is not enabled'), 501);
    });
  }
  // enabled
  else {
    import('./thread').then(({ createThreadHandlersFactory }) => {
      router.post('/thread', createThreadHandlersFactory(crowi));
    });

    import('./get-threads').then(({ getThreadsFactory }) => {
      router.get('/threads/:aiAssistantId', getThreadsFactory(crowi));
    });

    import('./delete-thread').then(({ deleteThreadFactory }) => {
      router.delete('/thread/:aiAssistantId/:threadRelationId', deleteThreadFactory(crowi));
    });

    import('./message').then(({ postMessageHandlersFactory }) => {
      router.post('/message', postMessageHandlersFactory(crowi));
    });

    import('./get-messages').then(({ getMessagesFactory }) => {
      router.get('/messages/:aiAssistantId/:threadId', getMessagesFactory(crowi));
    });

    import('./ai-assistant').then(({ createAiAssistantFactory }) => {
      router.post('/ai-assistant', createAiAssistantFactory(crowi));
    });

    import('./ai-assistants').then(({ getAiAssistantsFactory }) => {
      router.get('/ai-assistants', getAiAssistantsFactory(crowi));
    });

    import('./update-ai-assistant').then(({ updateAiAssistantsFactory }) => {
      router.put('/ai-assistant/:id', updateAiAssistantsFactory(crowi));
    });

    import('./set-default-ai-assistant').then(({ setDefaultAiAssistantFactory }) => {
      router.put('/ai-assistant/:id/set-default', setDefaultAiAssistantFactory(crowi));
    });

    import('./delete-ai-assistant').then(({ deleteAiAssistantsFactory }) => {
      router.delete('/ai-assistant/:id', deleteAiAssistantsFactory(crowi));
    });
  }

  return router;
};
