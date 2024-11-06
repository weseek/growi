// See: https://platform.openai.com/docs/assistants/tools/file-search#step-5-create-a-run-and-check-the-output

import type { IPageHasId } from '@growi/core/dist/interfaces';
import type { MessageDelta } from 'openai/resources/beta/threads/messages.mjs';

import VectorStoreFileRelationModel, { type VectorStoreFileRelation } from '~/features/openai/server/models/vector-store-file-relation';
import { configManager } from '~/server/service/config-manager';
import { getTranslation } from '~/server/service/i18next';

type PopulatedVectorStoreFileRelation = Omit<VectorStoreFileRelation, 'pageId'> & { pageId: IPageHasId }

export const annotationReplacer = async(delta: MessageDelta): Promise<void> => {
  const content = delta.content?.[0];

  if (content?.type === 'text' && content?.text?.annotations != null) {
    const annotations = content?.text?.annotations;
    for await (const annotation of annotations) {
      if (annotation.type === 'file_citation' && annotation.text != null) {

        const vectorStoreFileRelation = await VectorStoreFileRelationModel
          .findOne({ fileIds: { $in: [annotation.file_citation?.file_id] } })
          .populate('pageId', 'path') as PopulatedVectorStoreFileRelation;

        if (vectorStoreFileRelation != null) {
          const { t } = await getTranslation();
          const appSiteUrl = configManager?.getConfig('crowi', 'app:siteUrl');
          content.text.value = content.text.value?.replace(
            annotation.text,
            ` [${t('source')}: [${vectorStoreFileRelation.pageId.path}](${appSiteUrl}/${vectorStoreFileRelation.pageId._id})]`,
          );
        }
      }
    }
  }
};
