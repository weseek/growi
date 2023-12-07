import { apiPost } from '~/client/util/apiv1-client';

import type { ICommentPostArgs } from '../../interfaces';

export const updateComment = async(commentId: string, revisionId: string, comment: string): Promise<void> => {
  await apiPost('/comments.update', {
    commentForm: {
      comment,
      revision_id: revisionId,
      comment_id: commentId,
    },
  });
};

export const postComment = async(args: ICommentPostArgs): Promise<void> => {
  const { commentForm, slackNotificationForm } = args;
  const {
    pageId, revisionId, comment, replyTo, inline,
  } = commentForm;

  await apiPost('/comments.add', {
    commentForm: {
      comment,
      page_id: pageId,
      revision_id: revisionId,
      replyTo,
      inline,
    },
    slackNotificationForm,
  });
};
