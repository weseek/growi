import { useCallback } from 'react';

import type { Nullable } from '@growi/core';
import { parseISO } from 'date-fns';
import type { SWRResponse } from 'swr';
import useSWR from 'swr';

import { apiGet, apiPost } from '~/client/util/apiv1-client';

import type { ICommentHasIdList, ICommentPostArgs, ICommentHasId } from '../interfaces/comment';

interface ICommentRawFromAPI extends Omit<ICommentHasId, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

type IResponseCommentRaw = {
  comments: ICommentRawFromAPI[],
  ok: boolean,
}

// Directly transform raw comment to type Date
function transformCommentData(rawComment: ICommentRawFromAPI): ICommentHasId {
  return {
    ...rawComment,
    createdAt: parseISO(rawComment.createdAt),
    updatedAt: parseISO(rawComment.updatedAt),
  } as ICommentHasId;
}

type CommentOperation = {
  update(comment: string, revisionId: string, commentId: string): Promise<void>,
  post(args: ICommentPostArgs): Promise<void>
}

export const useSWRxPageComment = (pageId: Nullable<string>): SWRResponse<ICommentHasIdList, Error> & CommentOperation => {
  const shouldFetch: boolean = pageId != null;

  const swrResponse = useSWR(
    shouldFetch ? ['/comments.get', pageId] : null,
    async([endpoint, pageId]) => {
      const response: IResponseCommentRaw = await apiGet(endpoint, { page_id: pageId });
      const transformedComments: ICommentHasIdList = response.comments.map(transformCommentData);
      return transformedComments;
    },
  );

  const { mutate } = swrResponse;

  const update = useCallback(async(comment: string, revisionId: string, commentId: string) => {
    await apiPost('/comments.update', {
      commentForm: {
        comment,
        revision_id: revisionId,
        comment_id: commentId,
      },
    });
    mutate();
  }, [mutate]);

  const post = useCallback(async(args: ICommentPostArgs) => {
    const { commentForm, slackNotificationForm } = args;
    const { comment, revisionId, replyTo } = commentForm;
    const { isSlackEnabled, slackChannels } = slackNotificationForm;

    await apiPost('/comments.add', {
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
    });
    mutate();
  }, [mutate, pageId]);

  return {
    ...swrResponse,
    update,
    post,
  };
};
