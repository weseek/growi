import { useCallback, useEffect } from 'react';

import EventEmitter from 'events';

import type { DrawioEditByViewerProps } from '@growi/remark-drawio';

import { useSaveOrUpdate } from '~/client/services/page-operation';
import mdu from '~/components/PageEditor/MarkdownDrawioUtil';
import type { OptionsToSave } from '~/interfaces/page-operation';
import { useShareLinkId } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';
import { useSWRxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import loggerFactory from '~/utils/logger';


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
  const { data: tagsInfo } = useSWRxTagsInfo(currentPage?._id);

  const { open: openDrawioModal } = useDrawioModal();

  const saveOrUpdate = useSaveOrUpdate();

  const saveByDrawioModal = useCallback(async(drawioMxFile: string, bol: number, eol: number) => {
    if (currentPage == null || tagsInfo == null || shareLinkId != null) {
      return;
    }

    const currentMarkdown = currentPage.revision.body;
    const newMarkdown = mdu.replaceDrawioInMarkdown(drawioMxFile, currentMarkdown, bol, eol);

    const optionsToSave: OptionsToSave = {
      isSlackEnabled: false,
      slackChannels: '',
      grant: currentPage.grant,
      grantUserGroupId: currentPage.grantedGroup?._id,
      grantUserGroupName: currentPage.grantedGroup?.name,
      pageTags: tagsInfo.tags,
    };

    try {
      const currentRevisionId = currentPage.revision._id;
      await saveOrUpdate(
        newMarkdown,
        {
          pageId: currentPage._id, path: currentPage.path, revisionId: currentRevisionId, pageTags: tagsInfo.tags,
        },
        optionsToSave,
      );

      opts?.onSaveSuccess?.();
    }
    catch (error) {
      logger.error('failed to save', error);
      opts?.onSaveError?.(error);
    }
  }, [currentPage, opts, saveOrUpdate, shareLinkId, tagsInfo]);


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
