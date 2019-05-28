import { Container } from 'unstated';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @extends {Container} unstated Container
 */
export default class CommentContainer extends Container {

  constructor(crowi, pageId, revisionId) {
    super();

    this.crowi = crowi;
    this.pageId = pageId;
    this.revisionId = revisionId;

    this.state = {
      comments: [],
    };

    this.add = this.add.bind(this);
  }

  init() {
    if (!this.props.pageId) {
      return;
    }
  }

  add(comment) {
    const comments = this.state.comments;

    comments.push(comment);
    this.setState({ comments });
  }

  findAndSplice(comment) {
    const comments = this.state.comments;

    const index = comments.indexOf(comment);
    if (index < 0) {
      return;
    }
    comments.splice(index, 1);

    this.setState({ comments });
  }

  /**
   * Load data of comments and store them in state
   */
  retrieveComments() {
    // get data (desc order array)
    this.crowi.apiGet('/comments.get', { page_id: this.pageId })
      .then((res) => {
        if (res.ok) {
          this.setState({ comments: res.comments });
        }
      });
  }

  /**
   * Load data of comments and rerender <PageComments />
   */
  postComment(comment, isMarkdown, replyTo, isSlackEnabled, slackChannels) {
    return this.crowi.apiPost('/comments.add', {
      commentForm: {
        comment,
        _csrf: this.crowi.csrfToken,
        page_id: this.pageId,
        revision_id: this.revisionId,
        is_markdown: isMarkdown,
        replyTo,
      },
      slackNotificationForm: {
        isSlackEnabled,
        slackChannels,
      },
    })
      .then((res) => {
        if (res.ok) {
          this.add(res.comment);
        }
      });
  }

  deleteComment(comment) {
    return this.crowi.apiPost('/comments.remove', { comment_id: comment._id })
      .then((res) => {
        if (res.ok) {
          this.findAndSplice(comment);
        }
      });
  }

  uploadAttachment(file) {
    // const endpoint = '/attachments.add';

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

}
