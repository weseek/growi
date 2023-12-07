export interface ICommentPostArgs {
  commentForm: {
    comment: string,
    pageId?: string,
    revisionId?: string,
    replyTo?: string,
    inline?: boolean,
  },
  slackNotificationForm: {
    isSlackEnabled?: boolean,
    slackChannels?: string,
  },
}
