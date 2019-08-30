import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

const logger = loggerFactory('growi:services:CommentContainer');

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @extends {Container} unstated Container
 */
export default class CommentContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.appContainer.registerContainer(this);

    const mainContent = document.querySelector('#content-main');

    if (mainContent == null) {
      logger.debug('#content-main element is not exists');
      return;
    }

    this.state = {
      comments: [],

      // settings shared among all of CommentEditor
      isSlackEnabled: false,
      slackChannels: mainContent.getAttribute('data-slack-channels') || '',
    };

    this.retrieveComments = this.retrieveComments.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'CommentContainer';
  }

  getPageContainer() {
    return this.appContainer.getContainer('PageContainer');
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
    const { pageId } = this.getPageContainer().state;

    // get data (desc order array)
    return this.appContainer.apiGet('/comments.get', { page_id: pageId })
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
    const { pageId, revisionId } = this.getPageContainer().state;

    return this.appContainer.apiPost('/comments.add', {
      commentForm: {
        comment,
        page_id: pageId,
        revision_id: revisionId,
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

  /**
   * Load data of comments and rerender <PageComments />
   */
  putComment(comment, isMarkdown, replyTo, isSlackEnabled, slackChannels, commentId) {
    console.log(commentId);
  }

  deleteComment(comment) {
    return this.appContainer.apiPost('/comments.remove', { comment_id: comment._id })
      .then((res) => {
        if (res.ok) {
          this.findAndSplice(comment);
        }
      });
  }

  uploadAttachment(file) {
    const { pageId, pagePath } = this.getPageContainer().state;

    const endpoint = '/attachments.add';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', pagePath);
    formData.append('page_id', pageId);

    return this.appContainer.apiPost(endpoint, formData);
  }

}
