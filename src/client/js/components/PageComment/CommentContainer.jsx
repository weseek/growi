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
  }

  init() {
    if (!this.props.pageId) {
      return;
    }
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
    });
  }

  onUpload(file) {
    const endpoint = '/attachments.add';

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
