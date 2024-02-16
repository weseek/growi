import { useCallback, useEffect } from 'react';

import type EventEmitter from 'events';

import type MarkdownTable from '~/client/models/MarkdownTable';
import { getMarkdownTableFromLine, replaceMarkdownTableInMarkdown } from '~/components/Page/markdown-table-util-for-view';
import { useShareLinkId } from '~/stores/context';
import { useHandsontableModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { updatePage } from '../page-operation';


const logger = loggerFactory('growi:cli:side-effects:useHandsontableModalLauncherForView');


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


export const useHandsontableModalLauncherForView = (opts?: {
  onSaveSuccess?: () => void,
  onSaveError?: (error: any) => void,
}): void => {

  const { data: shareLinkId } = useShareLinkId();

  const { data: currentPage } = useSWRxCurrentPage();

  const { open: openHandsontableModal } = useHandsontableModal();

  const saveByHandsontableModal = useCallback(async(table: MarkdownTable, bol: number, eol: number) => {
    if (currentPage == null || shareLinkId != null) {
      return;
    }

    const currentMarkdown = currentPage.revision.body;
    const newMarkdown = replaceMarkdownTableInMarkdown(table, currentMarkdown, bol, eol);

    try {
      const currentRevisionId = currentPage.revision._id;
      await updatePage({
        pageId: currentPage._id,
        revisionId: currentRevisionId,
        body: newMarkdown,
      });

      opts?.onSaveSuccess?.();
    }
    catch (error) {
      logger.error('failed to save', error);
      opts?.onSaveError?.(error);
    }
  }, [currentPage, opts, shareLinkId]);


  // set handler to open HandsonTableModal
  useEffect(() => {
    if (currentPage == null || shareLinkId != null) {
      return;
    }

    const handler = (bol: number, eol: number) => {
      const markdown = currentPage.revision.body;
      const currentMarkdownTable = getMarkdownTableFromLine(markdown, bol, eol);
      openHandsontableModal(currentMarkdownTable, false, table => saveByHandsontableModal(table, bol, eol));
    };
    globalEmitter.on('launchHandsonTableModal', handler);

    return function cleanup() {
      globalEmitter.removeListener('launchHandsonTableModal', handler);
    };
  }, [currentPage, openHandsontableModal, saveByHandsontableModal, shareLinkId]);
};
