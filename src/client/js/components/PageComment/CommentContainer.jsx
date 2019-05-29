import { Container } from 'unstated';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @extends {Container} unstated Container
 */
export default class CommentContainer extends Container {

  constructor(crowi, pageId, pagePath, revisionId) {
    super();

    this.crowi = crowi;
    this.pageId = pageId;
    this.pagePath = pagePath;
    this.revisionId = revisionId;

    this.state = {
      comments: [],
    };

    this.retrieveComments = this.retrieveComments.bind(this);
  }

  init() {
    if (!this.props.pageId) {
      return;
    }
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
    return this.crowi.apiGet('/comments.get', { page_id: this.pageId })
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
          return this.retrieveComments();
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
    const endpoint = '/attachments.add';
    const formData = new FormData();
    formData.append('_csrf', this.crowi.csrfToken);
    formData.append('file', file);
    formData.append('path', this.pagePath);
    formData.append('page_id', this.pageId);

    return this.crowi.apiPost(endpoint, formData);
  }

}
