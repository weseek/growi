import React, {
  useCallback,
  useEffect, useRef, useState,
} from 'react';

import EventEmitter from 'events';

import dynamic from 'next/dynamic';
// import { debounce } from 'throttle-debounce';

import { HtmlElementNode } from 'rehype-toc';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { getOptionsToSave } from '~/client/util/editor';
import {
  useIsGuestUser, useCurrentPageTocNode, useShareLinkId,
} from '~/stores/context';
import {
  useSWRxSlackChannels, useIsSlackEnabled, usePageTagsForEditors, useIsEnabledUnsavedWarning,
} from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import {
  useEditorMode, useIsMobile,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './Page/RevisionRenderer';
import { DrawioModal } from './PageEditor/DrawioModal';
// import MarkdownTable from '~/client/models/MarkdownTable';
import mdu from './PageEditor/MarkdownDrawioUtil';
import mtu from './PageEditor/MarkdownTableUtil';


declare const globalEmitter: EventEmitter;

// const DrawioModal = dynamic(() => import('./PageEditor/DrawioModal'), { ssr: false });
const GridEditModal = dynamic(() => import('./PageEditor/GridEditModal'), { ssr: false });
// const HandsontableModal = dynamic(() => import('./PageEditor/HandsontableModal'), { ssr: false });
const LinkEditModal = dynamic(() => import('./PageEditor/LinkEditModal'), { ssr: false });

const logger = loggerFactory('growi:Page');

type PageSubstanceProps = {
  rendererOptions: any,
  page: any,
  pageTags?: string[],
  editorMode: string,
  isGuestUser: boolean,
  isMobile?: boolean,
  isSlackEnabled: boolean,
  slackChannels: string,
};

class PageSubstance extends React.Component<PageSubstanceProps> {

  gridEditModal: any;

  linkEditModal: any;

  handsontableModal: any;

  drawioModal: any;

  constructor(props: PageSubstanceProps) {
    super(props);

    this.state = {
      currentTargetTableArea: null,
      currentTargetDrawioArea: null,
    };

    this.gridEditModal = React.createRef();
    this.linkEditModal = React.createRef();
    this.handsontableModal = React.createRef();
    this.drawioModal = React.createRef();

    this.saveHandlerForHandsontableModal = this.saveHandlerForHandsontableModal.bind(this);
    this.saveHandlerForDrawioModal = this.saveHandlerForDrawioModal.bind(this);
  }

  /**
   * launch HandsontableModal with data specified by arguments
   * @param beginLineNumber
   * @param endLineNumber
   */
  launchHandsontableModal(beginLineNumber, endLineNumber) {
    // const markdown = this.props.pageContainer.state.markdown;
    // const tableLines = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber).join('\n');
    // this.setState({ currentTargetTableArea: { beginLineNumber, endLineNumber } });
    // this.handsontableModal.current.show(MarkdownTable.fromMarkdownString(tableLines));
  }

  /**
   * launch DrawioModal with data specified by arguments
   * @param beginLineNumber
   * @param endLineNumber
   */
  launchDrawioModal(beginLineNumber, endLineNumber) {
    // const markdown = this.props.pageContainer.state.markdown;
    // const drawioMarkdownArray = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber);
    // const drawioData = drawioMarkdownArray.slice(1, drawioMarkdownArray.length - 1).join('\n').trim();
    // this.setState({ currentTargetDrawioArea: { beginLineNumber, endLineNumber } });
    // this.drawioModal.current.show(drawioData);
  }

  async saveHandlerForHandsontableModal(markdownTable) {
    // const {
    //   isSlackEnabled, slackChannels, pageContainer, mutateIsEnabledUnsavedWarning, grant, grantGroupId, grantGroupName, pageTags,
    // } = this.props;
    // const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);

    // const newMarkdown = mtu.replaceMarkdownTableInMarkdown(
    //   markdownTable,
    //   this.props.pageContainer.state.markdown,
    //   this.state.currentTargetTableArea.beginLineNumber,
    //   this.state.currentTargetTableArea.endLineNumber,
    // );

    // try {
    //   // disable unsaved warning
    //   mutateIsEnabledUnsavedWarning(false);

    //   // eslint-disable-next-line no-unused-vars
    //   const { page, tags } = await pageContainer.save(newMarkdown, this.props.editorMode, optionsToSave);
    //   logger.debug('success to save');

    // // Todo: add translation
    // toastSuccess(t(''));
    // }
    // catch (error) {
    //   logger.error('failed to save', error);
    // toastError(error);
    // }
    // finally {
    //   this.setState({ currentTargetTableArea: null });
    // }
  }

  async saveHandlerForDrawioModal(drawioData) {
  //   const {
  //     isSlackEnabled, slackChannels, pageContainer, pageTags, grant, grantGroupId, grantGroupName, mutateIsEnabledUnsavedWarning,
  //   } = this.props;
  //   const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);

    //   const newMarkdown = mdu.replaceDrawioInMarkdown(
    //     drawioData,
    //     this.props.pageContainer.state.markdown,
    //     this.state.currentTargetDrawioArea.beginLineNumber,
    //     this.state.currentTargetDrawioArea.endLineNumber,
    //   );

    //   try {
    //     // disable unsaved warning
    //     mutateIsEnabledUnsavedWarning(false);

    //     // eslint-disable-next-line no-unused-vars
    //     const { page, tags } = await pageContainer.save(newMarkdown, this.props.editorMode, optionsToSave);
    //     logger.debug('success to save');

    // // Todo: add translation
    //   toastSuccess(t(''));
    //   }
  //   catch (error) {
  //     logger.error('failed to save', error);
  //     toastError(error);
  //   }
  //   finally {
  //     this.setState({ currentTargetDrawioArea: null });
  //   }
  }

  override render() {
    const {
      rendererOptions, page, isMobile, isGuestUser,
    } = this.props;
    const { path } = page;
    const { _id: revisionId, body: markdown } = page.revision;

    return (
      <div className={`mb-5 ${isMobile ? 'page-mobile' : ''}`}>

        { revisionId != null && (
          <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
        )}

        { !isGuestUser && (
          <>
            <GridEditModal ref={this.gridEditModal} />
            <LinkEditModal ref={this.linkEditModal} />
            {/* <HandsontableModal ref={this.handsontableModal} onSave={this.saveHandlerForHandsontableModal} /> */}
            {/* TODO: use global DrawioModal https://redmine.weseek.co.jp/issues/105981 */}
            {/* <DrawioModal
              ref={this.drawioModal}
              onSave={this.saveHandlerForDrawioModal}
            /> */}
          </>
        )}
      </div>
    );
  }

}

export const Page = (props) => {
  // Pass tocRef to generateViewOptions (=> rehypePlugin => customizeTOC) to call mutateCurrentPageTocNode when tocRef.current changes.
  // The toc node passed by customizeTOC is assigned to tocRef.current.
  const tocRef = useRef<HtmlElementNode>();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    tocRef.current = toc;
  }, []);

  const { data: shareLinkId } = useShareLinkId();
  const { data: currentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);
  const { data: editorMode } = useEditorMode();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isMobile } = useIsMobile();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPage?.path);
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageTags } = usePageTagsForEditors(null); // TODO: pass pageId
  const { data: rendererOptions } = useViewOptions(storeTocNodeHandler);
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const { mutate: mutateCurrentPageTocNode } = useCurrentPageTocNode();

  const pageRef = useRef(null);

  useEffect(() => {
    mutateCurrentPageTocNode(tocRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutateCurrentPageTocNode, tocRef.current]); // include tocRef.current to call mutateCurrentPageTocNode when tocRef.current changes

  // // set handler to open DrawioModal
  // useEffect(() => {
  //   const handler = (beginLineNumber, endLineNumber) => {
  //     if (pageRef?.current != null) {
  //       pageRef.current.launchDrawioModal(beginLineNumber, endLineNumber);
  //     }
  //   };
  //   window.globalEmitter.on('launchDrawioModal', handler);

  //   return function cleanup() {
  //     window.globalEmitter.removeListener('launchDrawioModal', handler);
  //   };
  // }, []);

  // // set handler to open HandsontableModal
  // useEffect(() => {
  //   const handler = (beginLineNumber, endLineNumber) => {
  //     if (pageRef?.current != null) {
  //       pageRef.current.launchHandsontableModal(beginLineNumber, endLineNumber);
  //     }
  //   };
  //   window.globalEmitter.on('launchHandsontableModal', handler);

  //   return function cleanup() {
  //     window.globalEmitter.removeListener('launchHandsontableModal', handler);
  //   };
  // }, []);

  if (currentPage == null || editorMode == null || isGuestUser == null || rendererOptions == null) {
    const entries = Object.entries({
      currentPage, editorMode, isGuestUser, rendererOptions,
    })
      .map(([key, value]) => [key, value == null ? 'null' : undefined])
      .filter(([, value]) => value != null);

    logger.warn('Some of materials are missing.', Object.fromEntries(entries));
    return null;
  }


  return (
    <PageSubstance
      {...props}
      ref={pageRef}
      rendererOptions={rendererOptions}
      page={currentPage}
      editorMode={editorMode}
      isGuestUser={isGuestUser}
      isMobile={isMobile}
      isSlackEnabled={isSlackEnabled}
      pageTags={pageTags}
      slackChannels={slackChannelsData?.toString()}
      mutateIsEnabledUnsavedWarning={mutateIsEnabledUnsavedWarning}
    />
  );
};
