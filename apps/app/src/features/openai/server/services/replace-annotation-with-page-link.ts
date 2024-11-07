// See: https://platform.openai.com/docs/assistants/tools/file-search#step-5-create-a-run-and-check-the-output

import type { IPageHasId, Lang } from '@growi/core/dist/interfaces';
import type { MessageContentDelta } from 'openai/resources/beta/threads/messages.mjs';

import VectorStoreFileRelationModel, { type VectorStoreFileRelation } from '~/features/openai/server/models/vector-store-file-relation';
import { getTranslation } from '~/server/service/i18next';

type PopulatedVectorStoreFileRelation = Omit<VectorStoreFileRelation, 'pageId'> & { pageId: IPageHasId }

export const replaceAnnotationWithPageLink = async(messageContentDelta: MessageContentDelta, lang?: Lang): Promise<void> => {
  if (messageContentDelta?.type === 'text' && messageContentDelta?.text?.annotations != null) {
    const annotations = messageContentDelta?.text?.annotations;
    for await (const annotation of annotations) {
      if (annotation.type === 'file_citation' && annotation.text != null) {

        const vectorStoreFileRelation = await VectorStoreFileRelationModel
          .findOne({ fileIds: { $in: [annotation.file_citation?.file_id] } })
          .populate('pageId', 'path') as PopulatedVectorStoreFileRelation;

        if (vectorStoreFileRelation != null) {
          const { t } = await getTranslation(lang);
          messageContentDelta.text.value = messageContentDelta.text.value?.replace(
            annotation.text,
            ` [${t('source')}: [${vectorStoreFileRelation.pageId.path}](/${vectorStoreFileRelation.pageId._id})]`,
          );
        }
      }
    }
  }
};
