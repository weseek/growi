export interface ICommentPostArgs {
  commentForm: {
    pageId: string,
    revisionId: string,
    comment: string,
    replyTo?: string,
    inline?: boolean,
  },
  slackNotificationForm: {
    isSlackEnabled?: boolean,
    slackChannels?: string,
  },
}
