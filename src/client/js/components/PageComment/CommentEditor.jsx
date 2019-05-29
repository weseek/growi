/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';

import Button from 'react-bootstrap/es/Button';
import Tab from 'react-bootstrap/es/Tab';
import Tabs from 'react-bootstrap/es/Tabs';
import * as toastr from 'toastr';
import UserPicture from '../User/UserPicture';
import ReactUtils from '../ReactUtils';

import GrowiRenderer from '../../util/GrowiRenderer';

import Editor from '../PageEditor/Editor';
import CommentContainer from './CommentContainer';
import CommentPreview from './CommentPreview';
import SlackNotification from '../SlackNotification';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @extends {React.Component}
 */

class CommentEditor extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isUploadable = config.upload.image || config.upload.file;
    const isUploadableFile = config.upload.file;

    this.state = {
      isLayoutTypeGrowi: false,
      comment: '',
      isMarkdown: true,
      html: '',
      key: 1,
      isUploadable,
      isUploadableFile,
      errorMessage: undefined,
      hasSlackConfig: config.hasSlackConfig,
      isSlackEnabled: false,
      slackChannels: this.props.slackChannels,
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, { mode: 'comment' });

    this.updateState = this.updateState.bind(this);
    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);

    this.postHandler = this.postHandler.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);

    this.renderHtml = this.renderHtml.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onSlackEnabledFlagChange = this.onSlackEnabledFlagChange.bind(this);
    this.onSlackChannelsChange = this.onSlackChannelsChange.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    const layoutType = this.props.crowi.getConfig().layoutType;
    this.setState({ isLayoutTypeGrowi: layoutType === 'crowi-plus' || layoutType === 'growi' });
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

  handleSelect(key) {
    this.setState({ key });
    this.renderHtml(this.state.comment);
  }

  onSlackEnabledFlagChange(value) {
    this.setState({ isSlackEnabled: value });
  }

  onSlackChannelsChange(value) {
    this.setState({ slackChannels: value });
  }

  /**
   * Post comment with CommentContainer and update state
   */
  postHandler(event) {
    if (event != null) {
      event.preventDefault();
    }

    this.props.commentContainer.postComment(
      this.state.comment,
      this.state.isMarkdown,
      this.props.replyTo, // TODO set replyTo
      this.state.isSlackEnabled,
      this.state.slackChannels,
    )
      .then((res) => {
        this.setState({
          comment: '',
          isMarkdown: true,
          html: '',
          key: 1,
          errorMessage: undefined,
          isSlackEnabled: false,
        });
        // reset value
        this.editor.setValue('');
      })
      .catch((err) => {
        const errorMessage = err.message || 'An unknown error occured when posting comment';
        this.setState({ errorMessage });
      });
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

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
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
    const crowi = this.props.crowi;
    const username = crowi.me;
    const user = crowi.findUser(username);
    const comment = this.state.comment;
    const commentPreview = this.state.isMarkdown ? this.getCommentHtml() : ReactUtils.nl2br(comment);
    const emojiStrategy = this.props.crowi.getEmojiStrategy();

    const isLayoutTypeGrowi = this.state.isLayoutTypeGrowi;

    const errorMessage = <span className="text-danger text-right mr-2">{this.state.errorMessage}</span>;
    const submitButton = (
      <Button
        bsStyle="primary"
        className="fcbtn btn btn-sm btn-primary btn-outline btn-rounded btn-1b"
        onClick={this.postHandler}
      >
        Comment
      </Button>
    );

    return (
      <div>

        { username
          && (
          <div className="comment-form">
            { isLayoutTypeGrowi
              && (
              <div className="comment-form-user">
                <UserPicture user={user} />
              </div>
              )
            }
            <div className="comment-form-main">
              <div className="comment-write">
                <Tabs activeKey={this.state.key} id="comment-form-tabs" onSelect={this.handleSelect} animation={false}>
                  <Tab eventKey={1} title="Write">
                    <Editor
                      ref={(c) => { this.editor = c }}
                      value={this.state.comment}
                      isGfmMode={this.state.isMarkdown}
                      editorOptions={this.props.editorOptions}
                      lineNumbers={false}
                      isMobile={this.props.crowi.isMobile}
                      isUploadable={this.state.isUploadable && this.state.isLayoutTypeGrowi} // enable only when GROWI layout
                      isUploadableFile={this.state.isUploadableFile}
                      emojiStrategy={emojiStrategy}
                      onChange={this.updateState}
                      onUpload={this.uploadHandler}
                      onCtrlEnter={this.postHandler}
                    />
                  </Tab>
                  { this.state.isMarkdown
                    && (
                    <Tab eventKey={2} title="Preview">
                      <div className="comment-form-preview">
                        {commentPreview}
                      </div>
                    </Tab>
                    )
                  }
                </Tabs>
              </div>
              <div className="comment-submit">
                <div className="d-flex">
                  <label style={{ flex: 1 }}>
                    { isLayoutTypeGrowi && this.state.key === 1
                      && (
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
                      )
                  }
                  </label>
                  <span className="hidden-xs">{ this.state.errorMessage && errorMessage }</span>
                  { this.state.hasSlackConfig
                    && (
                    <div className="form-inline align-self-center mr-md-2">
                      <SlackNotification
                        isSlackEnabled={this.state.isSlackEnabled}
                        slackChannels={this.state.slackChannels}
                        onEnabledFlagChange={this.onSlackEnabledFlagChange}
                        onChannelChange={this.onSlackChannelsChange}
                      />
                    </div>
                    )
                  }
                  <div className="hidden-xs">{submitButton}</div>
                </div>
                <div className="visible-xs mt-2">
                  <div className="d-flex justify-content-end">
                    { this.state.errorMessage && errorMessage }
                    <div>{submitButton}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        }

      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
class CommentEditorWrapper extends React.Component {

  render() {
    return (
      <Subscribe to={[CommentContainer]}>
        { commentContainer => (
          // eslint-disable-next-line arrow-body-style
          <CommentEditor commentContainer={commentContainer} {...this.props} />
        )}
      </Subscribe>
    );
  }

}

CommentEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
  replyTo: PropTypes.string,
};
CommentEditorWrapper.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
  replyTo: PropTypes.string,
};

export default CommentEditorWrapper;
