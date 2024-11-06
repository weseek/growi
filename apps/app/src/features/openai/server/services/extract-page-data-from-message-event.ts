import type { Message } from 'openai/resources/beta/threads/messages.mjs';

import VectorStoreFileRelationModel from '~/features/openai/server/models/vector-store-file-relation';

interface Page {
  path: string;
  id: string;
}

export const extructPageDataFromMessageEvent = async(message: Message): Promise<Page[]> => {
  const fileIds: string[] = [];
  for (const content of message.content) {
    if (content.type === 'text') {
      for (const annotation of content.text.annotations) {
        if (annotation.type === 'file_citation') {
          fileIds.push(annotation.file_citation.file_id);
        }
      }
    }
  }

  const pageData: Page[] = await VectorStoreFileRelationModel
    .find({ fileIds: { $in: fileIds } })
    .populate('pageId', 'path');

  return pageData;
};
