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

import { createSubscribedElement } from '../UnstatedUtils';
import UserPicture from '../User/UserPicture';
import Editor from '../PageEditor/Editor';
import SlackNotification from '../SlackNotification';

import CommentPreview from './CommentPreview';

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

    this.postHandler = this.postHandler.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);

    this.renderHtml = this.renderHtml.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onSlackEnabledFlagChange = this.onSlackEnabledFlagChange.bind(this);
    this.onSlackChannelsChange = this.onSlackChannelsChange.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
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

  toggleEditor() {
    const targetId = this.props.replyTo || this.props.currentCommentId;
    this.props.commentButtonClickedHandler(targetId);
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
    this.toggleEditor();
  }

  /**
   * Post comment with CommentContainer and update state
   */
  async postHandler(event) {
    if (event != null) {
      event.preventDefault();
    }

    try {
      if (this.props.currentCommentId != null) {
        await this.props.commentContainer.putComment(
          this.state.comment,
          this.state.isMarkdown,
          this.props.currentCommentId,
          this.props.commentCreator,
        );
      }
      else {
        await this.props.commentContainer.postComment(
          this.state.comment,
          this.state.isMarkdown,
          this.props.replyTo,
          this.props.commentContainer.state.isSlackEnabled,
          this.props.commentContainer.state.slackChannels,
        );
      }
      this.initializeEditor();
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

  render() {
    const { appContainer, commentContainer } = this.props;
    const { activeTab } = this.state;

    const username = appContainer.me;
    const user = appContainer.findUser(username);
    const commentPreview = this.state.isMarkdown ? this.getCommentHtml() : null;
    const emojiStrategy = appContainer.getEmojiStrategy();

    const layoutType = this.props.appContainer.getConfig().layoutType;
    const isBaloonStyle = layoutType.match(/crowi-plus|growi|kibela/);

    const errorMessage = <span className="text-danger text-right mr-2">{this.state.errorMessage}</span>;
    const cancelButton = (
      <Button outline color="danger" size="xs" className="fcbtn btn-rounded" onClick={this.toggleEditor}>
        Cancel
      </Button>
    );
    const submitButton = (
      <Button
        outline
        color="primary"
        className="fcbtn btn-rounded btn-1b"
        onClick={this.postHandler}
      >
        Comment
      </Button>
    );

    return (
      <div className="form page-comment-form">
        <div className="comment-form">
          { isBaloonStyle && (
            <div className="comment-form-user">
              <UserPicture user={user} />
            </div>
          ) }
          <div className="comment-form-main">
            <div className="comment-write">
              <Nav tabs>
                <NavItem>
                  <NavLink type="button" className={activeTab === 1 ? 'active' : ''} onClick={() => this.handleSelect(1)}>
                    Write
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink type="button" className={activeTab === 2 ? 'active' : ''} onClick={() => this.handleSelect(2)}>
                    Preview
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId={1}>
                  <Editor
                    ref={(c) => { this.editor = c }}
                    value={this.state.comment}
                    isGfmMode={this.state.isMarkdown}
                    lineNumbers={false}
                    isMobile={appContainer.isMobile}
                    isUploadable={this.state.isUploadable && this.state.isLayoutTypeGrowi} // enable only when GROWI layout
                    isUploadableFile={this.state.isUploadableFile}
                    emojiStrategy={emojiStrategy}
                    onChange={this.updateState}
                    onUpload={this.uploadHandler}
                    onCtrlEnter={this.postHandler}
                  />
                </TabPane>
                { this.state.isMarkdown && (
                  <TabPane tabId={2}>
                    <div className="comment-form-preview">
                      {commentPreview}
                    </div>
                  </TabPane>
                ) }
              </TabContent>
            </div>
            <div className="comment-submit">
              <div className="d-flex">
                <label style={{ flex: 1 }}>
                  { isBaloonStyle && activeTab === 1 && (
                    <span>
                      <input
                        type="checkbox"
                        id="comment-form-is-markdown"
                        name="isMarkdown"
                        checked={this.state.isMarkdown}
                        value="1"
                        onChange={this.updateStateCheckbox}
                      />
                      <span className="ml-2">Markdown</span>
                    </span>
                  ) }
                </label>
                <span className="d-none d-sm-inline">{ this.state.errorMessage && errorMessage }</span>
                { this.state.hasSlackConfig
                  && (
                  <div className="form-inline align-self-center mr-md-2">
                    <SlackNotification
                      isSlackEnabled={commentContainer.state.isSlackEnabled}
                      slackChannels={commentContainer.state.slackChannels}
                      onEnabledFlagChange={this.onSlackEnabledFlagChange}
                      onChannelChange={this.onSlackChannelsChange}
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
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const CommentEditorWrapper = (props) => {
  return createSubscribedElement(CommentEditor, props, [AppContainer, PageContainer, EditorContainer, CommentContainer]);
};

CommentEditor.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,

  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  replyTo: PropTypes.string,
  currentCommentId: PropTypes.string,
  commentBody: PropTypes.string,
  commentCreator: PropTypes.string,
  commentButtonClickedHandler: PropTypes.func.isRequired,
};

export default CommentEditorWrapper;
