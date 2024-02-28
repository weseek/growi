import { useCallback, useEffect } from 'react';

import type EventEmitter from 'events';

import type { DrawioEditByViewerProps } from '@growi/remark-drawio';

import { replaceDrawioInMarkdown } from '~/components/Page/markdown-drawio-util-for-view';
import { useShareLinkId } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { updatePage } from '../page-operation';


const logger = loggerFactory('growi:cli:side-effects:useDrawioModalLauncherForView');


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


export const useDrawioModalLauncherForView = (opts?: {
  onSaveSuccess?: () => void,
  onSaveError?: (error: any) => void,
}): void => {

  const { data: shareLinkId } = useShareLinkId();

  const { data: currentPage } = useSWRxCurrentPage();

  const { open: openDrawioModal } = useDrawioModal();

  const saveByDrawioModal = useCallback(async(drawioMxFile: string, bol: number, eol: number) => {
    if (currentPage == null || currentPage.revision == null || shareLinkId != null) {
      return;
    }

    const currentMarkdown = currentPage.revision.body;
    const newMarkdown = replaceDrawioInMarkdown(drawioMxFile, currentMarkdown, bol, eol);

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


  // set handler to open DrawioModal
  useEffect(() => {
    // disable if share link
    if (shareLinkId != null) {
      return;
    }

    const handler = (data: DrawioEditByViewerProps) => {
      openDrawioModal(data.drawioMxFile, drawioMxFile => saveByDrawioModal(drawioMxFile, data.bol, data.eol));
    };
    globalEmitter.on('launchDrawioModal', handler);

    return function cleanup() {
      globalEmitter.removeListener('launchDrawioModal', handler);
    };
  }, [openDrawioModal, saveByDrawioModal, shareLinkId]);
};
