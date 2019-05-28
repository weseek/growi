import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import Tab from 'react-bootstrap/es/Tab';
import Tabs from 'react-bootstrap/es/Tabs';
import * as toastr from 'toastr';
import UserPicture from '../User/UserPicture';
import ReactUtils from '../ReactUtils';

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

    this.state = {
    };

    // this.updateState = this.updateState.bind(this);
    // this.updateStateCheckbox = this.updateStateCheckbox.bind(this);
    // this.postComment = this.postComment.bind(this);
    // this.renderHtml = this.renderHtml.bind(this);
    // this.handleSelect = this.handleSelect.bind(this);
    // this.apiErrorHandler = this.apiErrorHandler.bind(this);
    // this.onUpload = this.onUpload.bind(this);
    // this.onSlackEnabledFlagChange = this.onSlackEnabledFlagChange.bind(this);
    // this.onSlackChannelsChange = this.onSlackChannelsChange.bind(this);
    // this.showCommentFormBtnClickHandler = this.showCommentFormBtnClickHandler.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    if (!this.props.data.pageId) {
      return;
    }
  }

  /**
   * Load data of comments and rerender <PageComments />
   */
  postComment(event) {
    if (event != null) {
      event.preventDefault();
    }

    // this.props.data.crowi.apiPost('/comments.add', {
    //   commentForm: {
    //     comment: this.state.comment,
    //     _csrf: this.props.data.crowi.csrfToken,
    //     page_id: this.props.data.pageId,
    //     revision_id: this.props.data.revisionId,
    //     is_markdown: this.state.isMarkdown,
    //     replyTo: this.props.replyTo,
    //   },
    //   slackNotificationForm: {
    //     isSlackEnabled: this.state.isSlackEnabled,
    //     slackChannels: this.state.slackChannels,
    //   },
    // })
    //   .then((res) => {
    //     if (this.props.onPostComplete != null) {
    //       this.props.onPostComplete(res.comment);
    //     }
    //     this.setState({
    //       comment: '',
    //       isMarkdown: true,
    //       html: '',
    //       key: 1,
    //       errorMessage: undefined,
    //       isSlackEnabled: false,
    //     });
    //     // reset value
    //     this.editor.setValue('');
    //   })
    //   .catch((err) => {
    //     const errorMessage = err.message || 'An unknown error occured when posting comment';
    //     this.setState({ errorMessage });
    //   });
  }

  onUpload(file) {
    const endpoint = '/attachments.add';

    // // create a FromData instance
    // const formData = new FormData();
    // formData.append('_csrf', this.props.data.crowi.csrfToken);
    // formData.append('file', file);
    // formData.append('path', this.props.data.pagePath);
    // formData.append('page_id', this.props.data.pageId || 0);

    // // post
    // this.props.data.crowi.apiPost(endpoint, formData)
    //   .then((res) => {
    //     const attachment = res.attachment;
    //     const fileName = attachment.originalName;

    //     let insertText = `[${fileName}](${attachment.filePathProxied})`;
    //     // when image
    //     if (attachment.fileFormat.startsWith('image/')) {
    //       // modify to "![fileName](url)" syntax
    //       insertText = `!${insertText}`;
    //     }
    //     this.editor.insertText(insertText);
    //   })
    //   .catch(this.apiErrorHandler)
    //   // finally
    //   .then(() => {
    //     this.editor.terminateUploadingState();
    //   });
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

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }

}

CommentForm.propTypes = {
  children: PropTypes.node.isRequired,
  onPostComplete: PropTypes.func,
  replyTo: PropTypes.string,
  data: PropTypes.object.isRequired,
};
