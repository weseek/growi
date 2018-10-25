import React from 'react';
import PropTypes from 'prop-types';
import ReactUtils from '../ReactUtils';

import Button from 'react-bootstrap/es/Button';
import Tab from 'react-bootstrap/es/Tab';
import Tabs from 'react-bootstrap/es/Tabs';
import UserPicture from '../User/UserPicture';
import * as toastr from 'toastr';

import GrowiRenderer from '../../util/GrowiRenderer';

import Editor from '../PageEditor/Editor';
import CommentPreview from './CommentPreview';
import SlackNotification from '../SlackNotification';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class Comment
 * @extends {React.Component}
 */

export default class CommentForm extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isUploadable = config.upload.image || config.upload.file;
    const isUploadableFile = config.upload.file;

    this.state = {
      isFormShown: false,
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

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, {mode: 'comment'});

    this.updateState = this.updateState.bind(this);
    this.updateStateCheckbox = this.updateStateCheckbox.bind(this);
    this.postComment = this.postComment.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.apiErrorHandler = this.apiErrorHandler.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onSlackEnabledFlagChange = this.onSlackEnabledFlagChange.bind(this);
    this.onSlackChannelsChange = this.onSlackChannelsChange.bind(this);
    this.showCommentFormBtnClickHandler = this.showCommentFormBtnClickHandler.bind(this);
  }

  updateState(value) {
    this.setState({comment: value});
  }

  updateStateCheckbox(event) {
    const value = event.target.checked;
    this.setState({isMarkdown: value});
    // changeMode
    this.refs.editor.setGfmMode(value);
  }

  handleSelect(key) {
    this.setState({ key });
    this.renderHtml(this.state.comment);
  }

  onSlackEnabledFlagChange(value) {
    this.setState({isSlackEnabled: value});
  }

  onSlackChannelsChange(value) {
    this.setState({slackChannels: value});
  }

  /**
   * Load data of comments and rerender <PageComments />
   */
  postComment(event) {
    if (event != null) {
      event.preventDefault();
    }

    this.props.crowi.apiPost('/comments.add', {
      commentForm: {
        comment: this.state.comment,
        _csrf: this.props.crowi.csrfToken,
        page_id: this.props.pageId,
        revision_id: this.props.revisionId,
        is_markdown: this.state.isMarkdown,
      },
      slackNotificationForm: {
        isSlackEnabled: this.state.isSlackEnabled,
        slackChannels: this.state.slackChannels,
      }
    })
    .then((res) => {
      if (this.props.onPostComplete != null) {
        this.props.onPostComplete(res.comment);
      }
      this.setState({
        comment: '',
        isMarkdown: true,
        html: '',
        key: 1,
        errorMessage: undefined,
        isSlackEnabled: false,
      });
      // reset value
      this.refs.editor.setValue('');
    })
    .catch(err => {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      this.setState({ errorMessage });
    });
  }

  getCommentHtml() {
    return (
      <CommentPreview
        html={this.state.html}
        inputRef={el => this.previewElement = el}/>
    );
  }

  renderHtml(markdown) {
    const context = {
      markdown,
      dom: this.previewElement,
    };

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRenderCommnetPreview', context)
      .then(() => interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => interceptorManager.process('postPreProcess', context))
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => interceptorManager.process('prePostProcess', context))
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context.dom);
      })
      .then(() => interceptorManager.process('postPostProcess', context))
      .then(() => interceptorManager.process('preRenderCommentPreviewHtml', context))
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postRenderCommentPreviewHtml', context));
  }

  generateInnerHtml(html) {
    return {__html: html};
  }

  onUpload(file) {
    const endpoint = '/attachments.add';

    // create a FromData instance
    const formData = new FormData();
    formData.append('_csrf', this.props.crowi.csrfToken);
    formData.append('file', file);
    formData.append('path', this.props.pagePath);
    formData.append('page_id', this.props.pageId || 0);

    // post
    this.props.crowi.apiPost(endpoint, formData)
      .then((res) => {
        const url = res.url;
        const attachment = res.attachment;
        const fileName = attachment.originalName;

        let insertText = `[${fileName}](${url})`;
        // when image
        if (attachment.fileFormat.startsWith('image/')) {
          // modify to "![fileName](url)" syntax
          insertText = '!' + insertText;
        }
        this.refs.editor.insertText(insertText);
      })
      .catch(this.apiErrorHandler)
      // finally
      .then(() => {
        this.refs.editor.terminateUploadingState();
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

  showCommentFormBtnClickHandler() {
    this.setState({ isFormShown: true });
  }

  renderControls() {

  }

  render() {
    const crowi = this.props.crowi;
    const username = crowi.me;
    const user = crowi.findUser(username);
    const creatorsPage = `/user/${username}`;
    const comment = this.state.comment;
    const commentPreview = this.state.isMarkdown ? this.getCommentHtml(): ReactUtils.nl2br(comment);
    const emojiStrategy = this.props.crowi.getEmojiStrategy();

    const errorMessage = <span className="text-danger text-right mr-2">{this.state.errorMessage}</span>;
    const submitButton = (
      <Button type="submit"bsStyle="primary" className="fcbtn btn btn-sm btn-primary btn-outline btn-rounded btn-1b">
        Comment
      </Button>
    );

    return (
      <div>

        { !this.state.isFormShown &&
          <button className="btn btn-lg btn-primary center-block" onClick={this.showCommentFormBtnClickHandler}>
            <i className="icon-bubble"></i> Add Comment
          </button>
        }

        { this.state.isFormShown &&
          <form className="form page-comment-form" id="page-comment-form" onSubmit={this.postComment}>
            { username &&
              <div className="comment-form">
                <div className="comment-form-user">
                  <a href={creatorsPage}>
                    <UserPicture user={user} />
                  </a>
                </div>
                <div className="comment-form-main">
                  <div className="comment-write">
                    <Tabs activeKey={this.state.key} id="comment-form-tabs" onSelect={this.handleSelect} animation={false}>
                      <Tab eventKey={1} title="Write">
                        <Editor ref="editor"
                          value={this.state.comment}
                          isGfmMode={this.state.isMarkdown}
                          editorOptions={this.props.editorOptions}
                          lineNumbers={false}
                          isMobile={this.props.crowi.isMobile}
                          isUploadable={this.state.isUploadable}
                          isUploadableFile={this.state.isUploadableFile}
                          emojiStrategy={emojiStrategy}
                          onChange={this.updateState}
                          onUpload={this.onUpload}
                          onCtrlEnter={this.postComment}
                        />
                      </Tab>
                      { this.state.isMarkdown == true &&
                      <Tab eventKey={2} title="Preview">
                        <div className="comment-form-preview">
                        {commentPreview}
                        </div>
                      </Tab>
                      }
                    </Tabs>
                  </div>
                  <div className="comment-submit">
                    <div className="d-flex">
                      <label style={{flex: 1}}>
                      { this.state.key == 1 &&
                        <span>
                          <input type="checkbox" id="comment-form-is-markdown" name="isMarkdown" checked={this.state.isMarkdown} value="1" onChange={this.updateStateCheckbox} /> Markdown
                        </span>
                      }
                      </label>
                      <span className="hidden-xs">{ this.state.errorMessage && errorMessage }</span>
                      { this.state.hasSlackConfig &&
                        <div className="form-inline align-self-center mr-md-2">
                          <SlackNotification
                            crowi={this.props.crowi}
                            pageId={this.props.pageId}
                            pagePath={this.props.pagePath}
                            isSlackEnabled={this.state.isSlackEnabled}
                            slackChannels={this.state.slackChannels}
                            onEnabledFlagChange={this.onSlackEnabledFlagChange}
                            onChannelChange={this.onSlackChannelsChange}
                          />
                        </div>
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
            }
          </form>
        }

      </div>
    );
  }
}

CommentForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  onPostComplete: PropTypes.func,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  pagePath: PropTypes.string,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
};
CommentForm.defaultProps = {
  editorOptions: {},
};
