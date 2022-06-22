import { Container } from 'unstated';

import loggerFactory from '~/utils/logger';

import { apiGet, apiPost, apiPostForm } from '../util/apiv1-client';
import { apiv3Put } from '../util/apiv3-client';

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
    };

    this.retrieveComments = this.retrieveComments.bind(this);
    this.checkAndUpdateImageOfCommentAuthers = this.checkAndUpdateImageOfCommentAuthers.bind(this);
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
  async retrieveComments() {
    const { pageId } = this.getPageContainer().state;

    // get data (desc order array)
    const res = await apiGet('/comments.get', { page_id: pageId });
    if (res.ok) {
      const comments = res.comments;
      this.setState({ comments });

      this.checkAndUpdateImageOfCommentAuthers(comments);
    }
  }

  async checkAndUpdateImageOfCommentAuthers(comments) {
    const noImageCacheUserIds = comments.filter((comment) => {
      const { creator } = comment;
      return creator != null && creator.imageUrlCached == null;
    }).map((comment) => {
      return comment.creator._id;
    });

    if (noImageCacheUserIds.length === 0) {
      return;
    }

    try {
      await apiv3Put('/users/update.imageUrlCache', { userIds: noImageCacheUserIds });
    }
    catch (err) {
      // Error alert doesn't apear, because user don't need to notice this error.
      logger.error(err);
    }
  }

  /**
   * Load data of comments and rerender <PageComments />
   */
  postComment(comment, replyTo, isSlackEnabled, slackChannels) {
    const { pageId, revisionId } = this.getPageContainer().state;

    return apiPost('/comments.add', {
      commentForm: {
        comment,
        page_id: pageId,
        revision_id: revisionId,
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
  putComment(comment, commentId, author) {
    const { pageId, revisionId } = this.getPageContainer().state;

    return apiPost('/comments.update', {
      commentForm: {
        comment,
        revision_id: revisionId,
        comment_id: commentId,
      },
    })
      .then((res) => {
        if (res.ok) {
          return this.retrieveComments();
        }
      });
  }

  deleteComment(comment) {
    return apiPost('/comments.remove', { comment_id: comment._id })
      .then((res) => {
        if (res.ok) {
          this.findAndSplice(comment);
        }
      });
  }

}
