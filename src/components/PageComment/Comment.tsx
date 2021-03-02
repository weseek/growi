import React, { useMemo, useState, VFC } from 'react';
import { format } from 'date-fns';

import { UncontrolledTooltip } from 'reactstrap';

import { Comment as IComment } from '~/interfaces/page';

import FormattedDistanceDate from '~/client/js/components/FormattedDistanceDate';
// import RevisionBody from '../Page/RevisionBody';
import UserPicture from '~/client/js/components/User/UserPicture';
import Username from '~/client/js/components/User/Username';
// import CommentEditor from './CommentEditor';
// import CommentControl from './CommentControl';
// import HistoryIcon from '../Icons/HistoryIcon';

type Props = {
  comment: IComment,
}

export const Comment:VFC<Props> = (props:Props) => {
  const [isReEdit, setIsReEdit] = useState(false);
  const { comment } = props;
  // const commentBody = isMarkdown ? this.renderRevisionBody() : this.renderText(comment.comment);
  const isEdited = comment.createdAt < comment.updatedAt;
  const editedDateId = `editedDate-${comment._id}`;
  const editedDateFormatted = isEdited ? format(comment.updatedAt, 'yyyy/MM/dd HH:mm') : null;

  const rootClassName:string = useMemo(() => {
    const className = 'page-comment flex-column';

    // const { revisionId, revisionCreatedAt } = this.props.pageContainer.state;
    // if (comment.revision === revisionId) {
    //   className += ' page-comment-current';
    // }
    // else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
    //   className += ' page-comment-newer';
    // }
    // else {
    //   className += ' page-comment-older';
    // }

    // if (this.isCurrentUserEqualsToAuthor()) {
    //   className += ' page-comment-me';
    // }

    return className;
  }, [comment]);

  return (
    <React.Fragment>
      {isReEdit ? (
        <p>TBD</p>
        // TODO GW-5147 implement comment editor
        // <CommentEditor
        //   growiRenderer={this.props.growiRenderer}
        //   currentCommentId={commentId}
        //   commentBody={comment.comment}
        //   replyTo={undefined}
        //   commentCreator={creator?.username}
        //   onCancelButtonClicked={() => this.setState({ isReEdit: false })}
        //   onCommentButtonClicked={() => this.setState({ isReEdit: false })}
        // />
        ) : (
          <div id={comment._id} className={rootClassName}>
            comment is here
            <div className="page-comment-writer">
              <UserPicture user={comment.creator} />
            </div>
            <div className="page-comment-main">
              <div className="page-comment-creator">
                <Username user={comment.creator} />
              </div>
              {/* <div className="page-comment-body">{commentBody}</div> */}
              <div className="page-comment-meta">
                <a href={`#${comment._id}`}>
                  <FormattedDistanceDate id={comment._id} date={comment.createdAt} />
                </a>
                { isEdited && (
                <>
                  <span id={editedDateId}>&nbsp;(edited)</span>
                  <UncontrolledTooltip placement="bottom" fade={false} target={editedDateId}>{editedDateFormatted}</UncontrolledTooltip>
                </>
                )}
                {/* <span className="ml-2">
                  <a id={`page-comment-revision-${commentId}`} className="page-comment-revision" href={revHref}>
                    <HistoryIcon />
                  </a>
                  <UncontrolledTooltip placement="bottom" fade={false} target={`page-comment-revision-${commentId}`}>
                    {t('page_comment.display_the_page_when_posting_this_comment')}
                  </UncontrolledTooltip>
                </span> */}
              </div>
              {/* {this.checkPermissionToControlComment() && (
                <CommentControl
                  onClickDeleteBtn={this.deleteBtnClickedHandler}
                  onClickEditBtn={() => this.setState({ isReEdit: true })}
                />
              ) } */}
            </div>
          </div>
        )
      }
    </React.Fragment>
  );
};

//   constructor(props) {
//     super(props);

//     this.state = {
//       html: '',
//       isReEdit: false,
//     };

//     this.isCurrentUserIsAuthor = this.isCurrentUserEqualsToAuthor.bind(this);
//     this.isCurrentRevision = this.isCurrentRevision.bind(this);
//     this.getRootClassName = this.getRootClassName.bind(this);
//     this.deleteBtnClickedHandler = this.deleteBtnClickedHandler.bind(this);
//     this.renderText = this.renderText.bind(this);
//     this.renderHtml = this.renderHtml.bind(this);
//   }


//   initCurrentRenderingContext() {
//     this.currentRenderingContext = {
//       markdown: this.props.comment.comment,
//     };
//   }

//   componentDidMount() {
//     this.initCurrentRenderingContext();
//     this.renderHtml();
//   }

//   componentDidUpdate(prevProps) {
//     const { comment: prevComment } = prevProps;
//     const { comment } = this.props;

//     // render only when props.markdown is updated
//     if (comment !== prevComment) {
//       this.initCurrentRenderingContext();
//       this.renderHtml();
//       return;
//     }

//     const { interceptorManager } = this.props.appContainer;

//     interceptorManager.process('postRenderCommentHtml', this.currentRenderingContext);
//   }

//   checkPermissionToControlComment() {
//     return this.props.appContainer.isAdmin || this.isCurrentUserEqualsToAuthor();
//   }

//   isCurrentUserEqualsToAuthor() {
//     const { creator } = this.props.comment;
//     if (creator == null) {
//       return false;
//     }
//     return creator.username === this.props.appContainer.currentUsername;
//   }

//   isCurrentRevision() {
//     return this.props.comment.revision === this.props.pageContainer.state.revisionId;
//   }

//   getRootClassName(comment) {
//     let className = 'page-comment flex-column';

//     const { revisionId, revisionCreatedAt } = this.props.pageContainer.state;
//     if (comment.revision === revisionId) {
//       className += ' page-comment-current';
//     }
//     else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
//       className += ' page-comment-newer';
//     }
//     else {
//       className += ' page-comment-older';
//     }

//     if (this.isCurrentUserEqualsToAuthor()) {
//       className += ' page-comment-me';
//     }

//     return className;
//   }

//   deleteBtnClickedHandler() {
//     this.props.deleteBtnClicked(this.props.comment);
//   }

//   renderText(comment) {
//     return <span style={{ whiteSpace: 'pre-wrap' }}>{comment}</span>;
//   }

//   renderRevisionBody() {
//     const config = this.props.appContainer.getConfig();
//     const isMathJaxEnabled = !!config.env.MATHJAX;
//     return (
//       <RevisionBody
//         html={this.state.html}
//         isMathJaxEnabled={isMathJaxEnabled}
//         renderMathJaxOnInit
//         additionalClassName="comment"
//       />
//     );
//   }

//   async renderHtml() {

//     const { growiRenderer, appContainer } = this.props;
//     const { interceptorManager } = appContainer;
//     const context = this.currentRenderingContext;

//     await interceptorManager.process('preRenderComment', context);
//     await interceptorManager.process('prePreProcess', context);
//     context.markdown = await growiRenderer.preProcess(context.markdown);
//     await interceptorManager.process('postPreProcess', context);
//     context.parsedHTML = await growiRenderer.process(context.markdown);
//     await interceptorManager.process('prePostProcess', context);
//     context.parsedHTML = await growiRenderer.postProcess(context.parsedHTML);
//     await interceptorManager.process('postPostProcess', context);
//     await interceptorManager.process('preRenderCommentHtml', context);
//     this.setState({ html: context.parsedHTML });
//     await interceptorManager.process('postRenderCommentHtml', context);
//   }

//   render() {
//     const { t } = this.props;
//     const comment = this.props.comment;
//     const commentId = comment._id;
//     const creator = comment.creator;
//     const isMarkdown = comment.isMarkdown;
//     const createdAt = new Date(comment.createdAt);
//     const updatedAt = new Date(comment.updatedAt);
//     const isEdited = createdAt < updatedAt;

//     const rootClassName = this.getRootClassName(comment);
//     const commentBody = isMarkdown ? this.renderRevisionBody() : this.renderText(comment.comment);
//     const revHref = `?revision=${comment.revision}`;

//     const editedDateId = `editedDate-${comment._id}`;
//     const editedDateFormatted = isEdited
//       ? format(updatedAt, 'yyyy/MM/dd HH:mm')
//       : null;

//   }

// }
