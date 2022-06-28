import React, { useEffect, useRef } from 'react';

import PropTypes from 'prop-types';

import MarkdownTable from '~/client/models/MarkdownTable';
import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';
import PageContainer from '~/client/services/PageContainer';
import { getOptionsToSave } from '~/client/util/editor';
import {
  useCurrentPagePath, useIsGuestUser,
} from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled, usePageTagsForEditors } from '~/stores/editor';
import {
  useEditorMode, useIsMobile, useSelectedGrant, useSelectedGrantGroupId, useSelectedGrantGroupName,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './Page/RevisionRenderer';
import DrawioModal from './PageEditor/DrawioModal';
import GridEditModal from './PageEditor/GridEditModal';
import HandsontableModal from './PageEditor/HandsontableModal';
import LinkEditModal from './PageEditor/LinkEditModal';
import mdu from './PageEditor/MarkdownDrawioUtil';
import mtu from './PageEditor/MarkdownTableUtil';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:Page');

class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentTargetTableArea: null,
      currentTargetDrawioArea: null,
    };

    this.growiRenderer = this.props.appContainer.getRenderer('page');

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
    const markdown = this.props.pageContainer.state.markdown;
    const tableLines = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber).join('\n');
    this.setState({ currentTargetTableArea: { beginLineNumber, endLineNumber } });
    this.handsontableModal.current.show(MarkdownTable.fromMarkdownString(tableLines));
  }

  /**
   * launch DrawioModal with data specified by arguments
   * @param beginLineNumber
   * @param endLineNumber
   */
  launchDrawioModal(beginLineNumber, endLineNumber) {
    const markdown = this.props.pageContainer.state.markdown;
    const drawioMarkdownArray = markdown.split(/\r\n|\r|\n/).slice(beginLineNumber - 1, endLineNumber);
    const drawioData = drawioMarkdownArray.slice(1, drawioMarkdownArray.length - 1).join('\n').trim();
    this.setState({ currentTargetDrawioArea: { beginLineNumber, endLineNumber } });
    this.drawioModal.current.show(drawioData);
  }

  async saveHandlerForHandsontableModal(markdownTable) {
    const {
      isSlackEnabled, slackChannels, pageContainer, editorContainer, grant, grantGroupId, grantGroupName, pageTags, mutateIsEnabledUnsavedWarning,
    } = this.props;
    const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);

    const newMarkdown = mtu.replaceMarkdownTableInMarkdown(
      markdownTable,
      this.props.pageContainer.state.markdown,
      this.state.currentTargetTableArea.beginLineNumber,
      this.state.currentTargetTableArea.endLineNumber,
    );

    try {
      // disable unsaved warning
      mutateIsEnabledUnsavedWarning(false)

      // eslint-disable-next-line no-unused-vars
      const { page, tags } = await pageContainer.save(newMarkdown, this.props.editorMode, optionsToSave);
      logger.debug('success to save');

      pageContainer.showSuccessToastr();
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
    finally {
      this.setState({ currentTargetTableArea: null });
    }
  }

  async saveHandlerForDrawioModal(drawioData) {
    const {
      isSlackEnabled, slackChannels, pageContainer, pageTags, grant, grantGroupId, grantGroupName, editorContainer, mutateIsEnabledUnsavedWarning,
    } = this.props;
    const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);

    const newMarkdown = mdu.replaceDrawioInMarkdown(
      drawioData,
      this.props.pageContainer.state.markdown,
      this.state.currentTargetDrawioArea.beginLineNumber,
      this.state.currentTargetDrawioArea.endLineNumber,
    );

    try {
      // disable unsaved warning
      mutateIsEnabledUnsavedWarning(false);

      // eslint-disable-next-line no-unused-vars
      const { page, tags } = await pageContainer.save(newMarkdown, this.props.editorMode, optionsToSave);
      logger.debug('success to save');

      pageContainer.showSuccessToastr();
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
    finally {
      this.setState({ currentTargetDrawioArea: null });
    }
  }

  render() {
    const {
      pageContainer, pagePath, isMobile, isGuestUser,
    } = this.props;
    const { markdown, revisionId } = pageContainer.state;

    return (
      <div className={`mb-5 ${isMobile ? 'page-mobile' : ''}`}>

        { revisionId != null && (
          <RevisionRenderer growiRenderer={this.growiRenderer} markdown={markdown} pagePath={pagePath} />
        )}

        { !isGuestUser && (
          <>
            <GridEditModal ref={this.gridEditModal} />
            <LinkEditModal ref={this.LinkEditModal} />
            <HandsontableModal ref={this.handsontableModal} onSave={this.saveHandlerForHandsontableModal} />
            <DrawioModal ref={this.drawioModal} onSave={this.saveHandlerForDrawioModal} />
          </>
        )}
      </div>
    );
  }

}

Page.propTypes = {
  // TODO: remove this when omitting unstated is completed
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  pagePath: PropTypes.string.isRequired,
  pageTags:  PropTypes.arrayOf(PropTypes.string),
  editorMode: PropTypes.string.isRequired,
  isGuestUser: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,
};

const PageWrapper = (props) => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: editorMode } = useEditorMode();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isMobile } = useIsMobile();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageTags } = usePageTagsForEditors();
  const { data: grant } = useSelectedGrant();
  const { data: grantGroupId } = useSelectedGrantGroupId();
  const { data: grantGroupName } = useSelectedGrantGroupName();
  const { mutate: mutateIsEnabledUnsavedWarning } = useUnsavedWarning();

  const pageRef = useRef(null);

  // set handler to open DrawioModal
  useEffect(() => {
    const handler = (beginLineNumber, endLineNumber) => {
      if (pageRef?.current != null) {
        pageRef.current.launchDrawioModal(beginLineNumber, endLineNumber);
      }
    };
    window.globalEmitter.on('launchDrawioModal', handler);

    return function cleanup() {
      window.globalEmitter.removeListener('launchDrawioModal', handler);
    };
  }, []);

  // set handler to open HandsontableModal
  useEffect(() => {
    const handler = (beginLineNumber, endLineNumber) => {
      if (pageRef?.current != null) {
        pageRef.current.launchHandsontableModal(beginLineNumber, endLineNumber);
      }
    };
    window.globalEmitter.on('launchHandsontableModal', handler);

    return function cleanup() {
      window.globalEmitter.removeListener('launchHandsontableModal', handler);
    };
  }, []);

  if (currentPagePath == null || editorMode == null || isGuestUser == null) {
    return null;
  }


  return (
    <Page
      {...props}
      ref={pageRef}
      pagePath={currentPagePath}
      editorMode={editorMode}
      isGuestUser={isGuestUser}
      isMobile={isMobile}
      isSlackEnabled={isSlackEnabled}
      pageTags={pageTags}
      slackChannels={slackChannelsData.toString()}
      grant={grant}
      grantGroupId={grantGroupId}
      grantGroupName={grantGroupName}
      mutateIsEnabledUnsavedWarning={mutateIsEnabledUnsavedWarning}
    />
  );
};

export default withUnstatedContainers(PageWrapper, [AppContainer, PageContainer, EditorContainer]);
