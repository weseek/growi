import { useCallback } from 'react';

import { type IComment, getIdForRef } from '@growi/core';
import deepmerge from 'ts-deepmerge';

import { apiPost } from '~/client/util/apiv1-client';
import { useSWRxCurrentPage } from '~/stores/page';

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

type PostComment = (args: ICommentPostArgs) => Promise<IComment>;

export const usePostComment = (): PostComment => {
  const { data: currentPage } = useSWRxCurrentPage();

  const currentPageId = currentPage?._id;
  const currentRevisionId = (currentPage != null)
    ? getIdForRef(currentPage.revision)
    : null;

  const postComment = useCallback((args) => {
    const { commentForm } = args;

    const pageId = commentForm.pageId ?? currentPageId;
    const revisionId = commentForm.revisionId ?? currentRevisionId;

    if (pageId == null) {
      throw new Error("'pageId' is null. Both 'pageId' and 'revisionId' must be specified.");
    }
    if (revisionId == null) {
      throw new Error("'revisionId' is null. Both 'pageId' and 'revisionId' must be specified.");
    }

    return apiPost<IComment>('/comments.add', deepmerge(args, {
      commentForm: {
        pageId,
        revisionId,
      },
    }));
  }, [currentPageId, currentRevisionId]);

  return postComment;
};
