export interface ICommentPostArgs {
  commentForm: {
    comment: string,
    revisionId: string,
    replyTo: string|undefined
  },
  slackNotificationForm: {
    isSlackEnabled: boolean|undefined,
    slackChannels: string|undefined,
  },
}
