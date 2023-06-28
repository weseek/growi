import EventEmitter from 'events';
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

type HandlerType = ((data: DrawioEditByViewerProps) => void) | ((bol: number, eol: number) => void);

export const useModalLauncherForView = (modalType: SaveByModalType, opts?: ModalLauncherOpts): void => {

  const { data: shareLinkId } = useShareLinkId();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: tagsInfo } = useSWRxTagsInfo(currentPage?._id);
  const { open: openDrawioModal } = useDrawioModal();
  const { open: openHandsontableModal } = useHandsontableModal();

  const saveOrUpdate = useSaveOrUpdate();

  // Return early if any of the conditions are met
  if (currentPage == null || tagsInfo == null || shareLinkId != null) {
    return;
  }

  const currentMarkdown = currentPage.revision.body;

  const saveByModal = async(newMarkdown: string) => {

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
  };

  // Open modal handler based on modalType
  const handleModalLaunch = () => {

    // Open drawio modal handler
    const drawioHandler = (data: DrawioEditByViewerProps) => {
      const { bol, eol, drawioMxFile } = data;
      openDrawioModal(drawioMxFile, (drawio) => {
        const newMarkdown = mdu.replaceDrawioInMarkdown(drawio, currentMarkdown, bol, eol);
        saveByModal(newMarkdown);
      });
    };

    // Open handsontable modal handler
    const handsontableHandler = (bol: number, eol: number) => {
      const currentMarkdownTable = mtu.getMarkdownTableFromLine(currentMarkdown, bol, eol);
      openHandsontableModal(currentMarkdownTable, undefined, false, (table) => {
        const newMarkdown = mtu.replaceMarkdownTableInMarkdown(table, currentMarkdown, bol, eol);
        saveByModal(newMarkdown);
      });
    };

    // Set default value of handler and eventName
    let handler: HandlerType = () => {};
    let eventName = '';

    // Choose appropriate handler and eventName name based on modalType
    switch (modalType) {
      case SaveByModalType.DRAWIO:
        handler = drawioHandler;
        eventName = 'launchDrawioModal';
        break;
      case SaveByModalType.HANDSONTABLE:
        handler = handsontableHandler;
        eventName = 'launchHandsonTableModal';
        break;
      default:
        break;
    }

    // Subscribe to the global event using the event name and handler function
    globalEmitter.on(eventName, handler);

    // Clean up the subscription by removing the event listener
    return function cleanup() {
      globalEmitter.removeListener(eventName, handler);
    };
  };

  handleModalLaunch();
};
