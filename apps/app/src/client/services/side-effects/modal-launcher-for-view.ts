import EventEmitter from 'events';
import { useCallback, useEffect } from 'react';
import MarkdownTable from '~/client/models/MarkdownTable';
import mdu from '~/components/PageEditor/MarkdownDrawioUtil';
import mtu from '~/components/PageEditor/MarkdownTableUtil';
import { OptionsToSave, SaveByModalType } from '~/interfaces/page-operation';
import { useShareLinkId } from '~/stores/context';
import { useSWRxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import loggerFactory from '~/utils/logger';
import { useSaveOrUpdate } from '../page-operation';
import { DrawioEditByViewerProps } from '@growi/remark-drawio';
import { useDrawioModal, useHandsontableModal } from '~/stores/modal';

const logger = loggerFactory('growi:cli:side-effects:useModalLauncherForView');

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

type ModalLauncherOpts = {
  onSaveSuccess?: () => void,
  onSaveError?: (error: any) => void,
}

export const useModalLauncherForView = (modalType: SaveByModalType, opts?: ModalLauncherOpts): void => {

  const { data: shareLinkId } = useShareLinkId();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: tagsInfo } = useSWRxTagsInfo(currentPage?._id);
  const { open: openDrawioModal } = useDrawioModal();
  const { open: openHandsontableModal } = useHandsontableModal();

  const saveOrUpdate = useSaveOrUpdate();

  const saveByModal = useCallback(async(data: string | MarkdownTable, bol: number, eol: number) => {
    if (currentPage == null || tagsInfo == null || shareLinkId != null) {
      return;
    }

    const currentMarkdown = currentPage.revision.body;
    // Replace markdown based on `modalType`
    const newMarkdown = modalType === SaveByModalType.DRAWIO
      ? mdu.replaceDrawioInMarkdown(data as string, currentMarkdown, bol, eol)
      : mtu.replaceMarkdownTableInMarkdown(data as MarkdownTable, currentMarkdown, bol, eol);

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
        { pageId: currentPage._id, path: currentPage.path, revisionId: currentRevisionId },
        optionsToSave,
      );

      opts?.onSaveSuccess?.();
    }
    catch (error) {
      logger.error('failed to save', error);
      opts?.onSaveError?.(error);
    }
  }, [currentPage, modalType, opts, saveOrUpdate, shareLinkId, tagsInfo]);

  // Set handler to open modal based on modalType
  useEffect(() => {
    if (currentPage == null || shareLinkId != null) {
      return;
    }

    // Open drawio modal handler
    const drawioHandler = (data: DrawioEditByViewerProps) => {
      openDrawioModal(data.drawioMxFile, drawioMxFile => saveByModal(drawioMxFile, data.bol, data.eol));
    };

    // Open handsontable modal handler
    const handsontableHandler = (bol: number, eol: number) => {
      const markdown = currentPage.revision.body;
      const currentMarkdownTable = mtu.getMarkdownTableFromLine(markdown, bol, eol);
      openHandsontableModal(currentMarkdownTable, undefined, false, table => saveByModal(table, bol, eol));
    };

    // Choose appropriate handler and eventName name based on modalType
    const handler = modalType === SaveByModalType.DRAWIO ? drawioHandler : handsontableHandler;
    const eventName = modalType === SaveByModalType.DRAWIO ? 'launchDrawioModal' : 'launchHandsonTableModal';

    globalEmitter.on(eventName, handler);

    return function cleanup() {
      globalEmitter.removeListener(eventName, handler);
    };
  }, [currentPage, modalType, openDrawioModal, openHandsontableModal, saveByModal, shareLinkId]);
};
