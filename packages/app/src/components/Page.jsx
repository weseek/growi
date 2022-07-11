import React, { useEffect, useRef } from 'react';

import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

import MarkdownTable from '~/client/models/MarkdownTable';
import { getOptionsToSave } from '~/client/util/editor';
import GrowiRenderer from '~/services/renderer/growi-renderer';
import {
  useIsGuestUser,
} from '~/stores/context';
import {
  useSWRxSlackChannels, useIsSlackEnabled, usePageTagsForEditors, useIsEnabledUnsavedWarning,
} from '~/stores/editor';
import { useViewRenderer } from '~/stores/renderer';
import {
  useEditorMode, useIsMobile,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './Page/RevisionRenderer';
import mdu from './PageEditor/MarkdownDrawioUtil';
import mtu from './PageEditor/MarkdownTableUtil';
import { useSWRxCurrentPage } from '~/stores/page';

const logger = loggerFactory('growi:Page');

class PageSubstance extends React.Component {

  constructor(props) {
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

    //   pageContainer.showSuccessToastr();
    // }
    // catch (error) {
    //   logger.error('failed to save', error);
    //   pageContainer.showErrorToastr(error);
    // }
    // finally {
    //   this.setState({ currentTargetTableArea: null });
    // }
  }

  async saveHandlerForDrawioModal(drawioData) {
    // const {
    //   isSlackEnabled, slackChannels, pageContainer, pageTags, grant, grantGroupId, grantGroupName, mutateIsEnabledUnsavedWarning,
    // } = this.props;
    // const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);

    // const newMarkdown = mdu.replaceDrawioInMarkdown(
    //   drawioData,
    //   this.props.pageContainer.state.markdown,
    //   this.state.currentTargetDrawioArea.beginLineNumber,
    //   this.state.currentTargetDrawioArea.endLineNumber,
    // );

    // try {
    //   // disable unsaved warning
    //   mutateIsEnabledUnsavedWarning(false);

    //   // eslint-disable-next-line no-unused-vars
    //   const { page, tags } = await pageContainer.save(newMarkdown, this.props.editorMode, optionsToSave);
    //   logger.debug('success to save');

    //   pageContainer.showSuccessToastr();
    // }
    // catch (error) {
    //   logger.error('failed to save', error);
    //   pageContainer.showErrorToastr(error);
    // }
    // finally {
    //   this.setState({ currentTargetDrawioArea: null });
    // }
  }

  render() {
    const {
      page, isMobile, isGuestUser,
    } = this.props;
    const { path } = page;
    const { body: markdown, revisionId } = page.revision;

    // const DrawioModal = dynamic(() => import('./PageEditor/DrawioModal'), { ssr: false });
    // const GridEditModal = dynamic(() => import('./PageEditor/GridEditModal'), { ssr: false });
    // const HandsontableModal = dynamic(() => import('./PageEditor/HandsontableModal'), { ssr: false });
    // const LinkEditModal = dynamic(() => import('./PageEditor/LinkEditModal'), { ssr: false });

    return (
      <div className={`mb-5 ${isMobile ? 'page-mobile' : ''}`}>

        { revisionId != null && (
          <RevisionRenderer growiRenderer={this.props.growiRenderer} markdown={markdown} pagePath={path} />
        )}

        { !isGuestUser && (
          <>
            {/* <GridEditModal ref={this.gridEditModal} /> */}
            {/* <LinkEditModal ref={this.LinkEditModal} /> */}
            {/* <HandsontableModal ref={this.handsontableModal} onSave={this.saveHandlerForHandsontableModal} /> */}
            {/* <DrawioModal ref={this.drawioModal} onSave={this.saveHandlerForDrawioModal} /> */}
          </>
        )}
      </div>
    );
  }

}

PageSubstance.propTypes = {
  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,

  page: PropTypes.any.isRequired,
  pageTags:  PropTypes.arrayOf(PropTypes.string),
  editorMode: PropTypes.string.isRequired,
  isGuestUser: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
};

export const Page = (props) => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isMobile } = useIsMobile();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPage?.path);
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageTags } = usePageTagsForEditors();
  const { data: growiRenderer } = useViewRenderer();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();

  const pageRef = useRef(null);

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

  if (currentPage == null || editorMode == null || isGuestUser == null || growiRenderer == null) {
    return null;
  }


  return (
    <PageSubstance
      {...props}
      ref={pageRef}
      growiRenderer={growiRenderer}
      page={currentPage}
      editorMode={editorMode}
      isGuestUser={isGuestUser}
      isMobile={isMobile}
      isSlackEnabled={isSlackEnabled}
      pageTags={pageTags}
      slackChannels={slackChannelsData.toString()}
      mutateIsEnabledUnsavedWarning={mutateIsEnabledUnsavedWarning}
    />
  );
};
