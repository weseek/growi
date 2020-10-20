import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';

import * as toastr from 'toastr';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import CommentContainer from '../../services/CommentContainer';
import EditorContainer from '../../services/EditorContainer';
import GrowiRenderer from '../../util/GrowiRenderer';

import { withUnstatedContainers } from '../UnstatedUtils';
import UserPicture from '../User/UserPicture';
import Editor from '../PageEditor/Editor';
import SlackNotification from '../SlackNotification';

import CommentPreview from './CommentPreview';
import NotAvailableForGuest from '../NotAvailableForGuest';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @extends {React.Component}
 */

class CommentEditor extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.appContainer.getConfig();
    const isUploadable = config.upload.image || config.upload.file;
    const isUploadableFile = config.upload.file;

    this.state = {
      isReadyToUse: !this.props.isForNewComment,
      comment: this.props.commentBody || '',
      isMarkdown: true,
      html: '',
      activeTab: 1,
      isUploadable,
      isUploadableFile,
      errorMessage: undefined,
      hasSlackConfig: config.hasSlackConfig,
    };

    this.updateState = this.updateState.bind(this);
    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);

    this.cancelButtonClickedHandler = this.cancelButtonClickedHandler.bind(this);
    this.commentButtonClickedHandler = this.commentButtonClickedHandler.bind(this);
    this.ctrlEnterHandler = this.ctrlEnterHandler.bind(this);
    this.postComment = this.postComment.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);

    this.renderHtml = this.renderHtml.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onSlackEnabledFlagChange = this.onSlackEnabledFlagChange.bind(this);
    this.onSlackChannelsChange = this.onSlackChannelsChange.bind(this);
  }

  updateState(value) {
    this.setState({ comment: value });
  }

  updateStateCheckbox(event) {
    const value = event.target.checked;
    this.setState({ isMarkdown: value });
    // changeMode
    this.editor.setGfmMode(value);
  }

  handleSelect(activeTab) {
    this.setState({ activeTab });
    this.renderHtml(this.state.comment);
  }

  onSlackEnabledFlagChange(isSlackEnabled) {
    this.props.commentContainer.setState({ isSlackEnabled });
  }

  onSlackChannelsChange(slackChannels) {
    this.props.commentContainer.setState({ slackChannels });
  }

  initializeEditor() {
    this.setState({
      comment: '',
      isMarkdown: true,
      html: '',
      activeTab: 1,
      errorMessage: undefined,
    });
    // reset value
    this.editor.setValue('');
  }

  cancelButtonClickedHandler() {
    const { isForNewComment, onCancelButtonClicked } = this.props;

    // change state to not ready
    // when this editor is for the new comment mode
    if (isForNewComment) {
      this.setState({ isReadyToUse: false });
    }

    if (onCancelButtonClicked != null) {
      const { replyTo, currentCommentId } = this.props;
      onCancelButtonClicked(replyTo || currentCommentId);
    }
  }

  commentButtonClickedHandler() {
    this.postComment();
  }

  ctrlEnterHandler(event) {
    if (event != null) {
      event.preventDefault();
    }

    this.postComment();
  }

  /**
   * Post comment with CommentContainer and update state
   */
  async postComment() {
    const {
      commentContainer, replyTo, currentCommentId, commentCreator, onCommentButtonClicked,
    } = this.props;
    try {
      if (currentCommentId != null) {
        await commentContainer.putComment(
          this.state.comment,
          this.state.isMarkdown,
          currentCommentId,
          commentCreator,
        );
      }
      else {
        await this.props.commentContainer.postComment(
          this.state.comment,
          this.state.isMarkdown,
          replyTo,
          commentContainer.state.isSlackEnabled,
          commentContainer.state.slackChannels,
        );
      }
      this.initializeEditor();

      if (onCommentButtonClicked != null) {
        onCommentButtonClicked(replyTo || currentCommentId);
      }
    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      this.setState({ errorMessage });
    }
  }

  uploadHandler(file) {
    this.props.commentContainer.uploadAttachment(file)
      .then((res) => {
        const attachment = res.attachment;
        const fileName = attachment.originalName;

        let insertText = `[${fileName}](${attachment.filePathProxied})`;
        // when image
        if (attachment.fileFormat.startsWith('image/')) {
          // modify to "![fileName](url)" syntax
          insertText = `!${insertText}`;
        }
        this.editor.insertText(insertText);
      })
      .catch(this.apiErrorHandler)
      // finally
      .then(() => {
        this.editor.terminateUploadingState();
      });
  }

  apiErrorHandler(error) {
    toastr.error(error.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  getCommentHtml() {
    return (
      <CommentPreview
        inputRef={(el) => { this.previewElement = el }}
        html={this.state.html}
      />
    );
  }

  renderHtml(markdown) {
    const context = {
      markdown,
    };

    const { growiRenderer } = this.props;
    const interceptorManager = this.props.appContainer.interceptorManager;
    interceptorManager.process('preRenderCommnetPreview', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderCommentPreviewHtml', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderCommentPreviewHtml', context) });
  }

  generateInnerHtml(html) {
    return { __html: html };
  }

  renderBeforeReady() {
    return (
      <div className="text-center">
        <NotAvailableForGuest>
          <button
            type="button"
            className="btn btn-lg btn-link"
            onClick={() => this.setState({ isReadyToUse: true })}
          >
            <i className="icon-bubble"></i> Add Comment
          </button>
        </NotAvailableForGuest>
      </div>
    );
  }

  renderReady() {
    const { appContainer, commentContainer } = this.props;
    const { activeTab } = this.state;

    const commentPreview = this.state.isMarkdown ? this.getCommentHtml() : null;
    const emojiStrategy = appContainer.getEmojiStrategy();

    const errorMessage = <span className="text-danger text-right mr-2">{this.state.errorMessage}</span>;
    const cancelButton = (
      <Button outline color="danger" size="xs" className="btn btn-outline-danger rounded-pill" onClick={this.cancelButtonClickedHandler}>
        Cancel
      </Button>
    );
    const submitButton = (
      <Button
        outline
        color="primary"
        className="btn btn-outline-primary rounded-pill"
        onClick={this.commentButtonClickedHandler}
      >
        Comment
      </Button>
    );

    return (
      <>
        <div className="comment-write">
          <Nav tabs>
            <NavItem>
              <NavLink type="button" className={activeTab === 1 ? 'active' : ''} onClick={() => this.handleSelect(1)}>
                    Write
              </NavLink>
            </NavItem>
            { this.state.isMarkdown && (
            <NavItem>
              <NavLink type="button" className={activeTab === 2 ? 'active' : ''} onClick={() => this.handleSelect(2)}>
                      Preview
              </NavLink>
            </NavItem>
                ) }
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId={1}>
              <Editor
                ref={(c) => { this.editor = c }}
                value={this.state.comment}
                isGfmMode={this.state.isMarkdown}
                lineNumbers={false}
                isMobile={appContainer.isMobile}
                isUploadable={this.state.isUploadable}
                isUploadableFile={this.state.isUploadableFile}
                emojiStrategy={emojiStrategy}
                onChange={this.updateState}
                onUpload={this.uploadHandler}
                onCtrlEnter={this.ctrlEnterHandler}
              />
            </TabPane>
            <TabPane tabId={2}>
              <div className="comment-form-preview">
                {commentPreview}
              </div>
            </TabPane>
          </TabContent>
        </div>

        <div className="comment-submit">
          <div className="d-flex">
            <label className="mr-2">
              {activeTab === 1 && (
              <span className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="comment-form-is-markdown"
                  name="isMarkdown"
                  checked={this.state.isMarkdown}
                  value="1"
                  onChange={this.updateStateCheckbox}
                />
                <label
                  className="ml-2 custom-control-label"
                  htmlFor="comment-form-is-markdown"
                >
                  Markdown
                </label>
              </span>
                  ) }
            </label>
            <span className="flex-grow-1" />
            <span className="d-none d-sm-inline">{ this.state.errorMessage && errorMessage }</span>

            { this.state.hasSlackConfig
              && (
              <div className="form-inline align-self-center mr-md-2">
                <SlackNotification
                  isSlackEnabled={commentContainer.state.isSlackEnabled}
                  slackChannels={commentContainer.state.slackChannels}
                  onEnabledFlagChange={this.onSlackEnabledFlagChange}
                  onChannelChange={this.onSlackChannelsChange}
                  id="idForComment"
                />
              </div>
              )
            }
            <div className="d-none d-sm-block">
              <span className="mr-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
          <div className="d-block d-sm-none mt-2">
            <div className="d-flex justify-content-end">
              { this.state.errorMessage && errorMessage }
              <span className="mr-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { appContainer } = this.props;
    const { isReadyToUse } = this.state;

    return (
      <div className="form page-comment-form">
        <div className="comment-form">
          <div className="comment-form-user">
            <UserPicture user={appContainer.currentUser} noLink noTooltip />
          </div>
          <div className="comment-form-main">
            { !isReadyToUse
              ? this.renderBeforeReady()
              : this.renderReady()
            }
          </div>
        </div>
      </div>
    );
  }

}

CommentEditor.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,

  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  isForNewComment: PropTypes.bool,
  replyTo: PropTypes.string,
  currentCommentId: PropTypes.string,
  commentBody: PropTypes.string,
  commentCreator: PropTypes.string,
  onCancelButtonClicked: PropTypes.func,
  onCommentButtonClicked: PropTypes.func,
};

/**
 * Wrapper component for using unstated
 */
const CommentEditorWrapper = withUnstatedContainers(CommentEditor, [AppContainer, PageContainer, EditorContainer, CommentContainer]);

export default CommentEditorWrapper;
