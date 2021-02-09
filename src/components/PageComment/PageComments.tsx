import { FC, memo } from 'react';
// import PropTypes from 'prop-types';
import { useCurrentPageCommentsSWR } from '~/stores/page';
import { Comment } from '~/interfaces/page';
// import {
//   Button,
// } from 'reactstrap';

// import { withTranslation } from 'react-i18next';

// import AppContainer from '../services/AppContainer';
// import CommentContainer from '../services/CommentContainer';
// import PageContainer from '../services/PageContainer';

// import { withUnstatedContainers } from './UnstatedUtils';

// import CommentEditor from './PageComment/CommentEditor';
// import Comment from './PageComment/Comment';
// import DeleteCommentModal from './PageComment/DeleteCommentModal';
// import ReplayComments from './PageComment/ReplayComments';

type Props = {
  comment: Comment;
  replies: Comment[];
}

const CommentThread:FC<Props> = memo(({ comment, replies }:Props) => {
  const commentId = comment._id;
  // const showEditor = this.state.showEditorIds.has(commentId);
  // const isLoggedIn = this.props.appContainer.currentUser != null;

  const rootClassNames = 'page-comment-thread';
  // if (replies.length === 0) {
  //   rootClassNames += ' page-comment-thread-no-replies';
  // }

  return (
    <div key={commentId} className={rootClassNames}>
      hoge
      {/* <Comment
        comment={comment}
        deleteBtnClicked={this.confirmToDeleteComment}
        growiRenderer={this.growiRenderer}
      /> */}
      {/* {replies.length !== 0 && (
      <ReplayComments
        replyList={replies}
        deleteBtnClicked={this.confirmToDeleteComment}
        growiRenderer={this.growiRenderer}
      />
      )}
      { !showEditor && isLoggedIn && (
        <div className="text-right">
          <Button
            outline
            color="secondary"
            size="sm"
            className="btn-comment-reply"
            onClick={() => { return this.replyButtonClickedHandler(commentId) }}
          >
            <i className="icon-fw icon-action-undo"></i> Reply
          </Button>
        </div>
      )}
      { showEditor && (
        <div className="page-comment-reply-form ml-4 ml-sm-5 mr-3">
          <CommentEditor
            growiRenderer={this.growiRenderer}
            replyTo={commentId}
            onCancelButtonClicked={this.editorCancelHandler}
            onCommentButtonClicked={this.editorCommentHandler}
          />
        </div>
      )} */}
    </div>
  );
});


export const PageComments:FC = () => {
  const { data: comments } = useCurrentPageCommentsSWR();

  if (comments == null) {
    return null;
  }

  const topLevelComments = [] as Comment[];
  const replyComments = [] as Comment[];

  comments.forEach((comment) => {
    if (comment.replyTo == null) {
      // comment is not a reply
      topLevelComments.push(comment);
    }
    else {
      // comment is a reply
      replyComments.push(comment);
    }
  });

  console.log(topLevelComments, replyComments);

  return (
    <>
      { topLevelComments.map((topLevelComment) => {
        // get related replies
        const replies = replyComments.filter(reply => reply.replyTo === topLevelComment._id);

        return <CommentThread comment={topLevelComment} replies={replies} />;
      }) }

      {/* <DeleteCommentModal
        isShown={this.state.isDeleteConfirmModalShown}
        comment={this.state.commentToDelete}
        errorMessage={this.state.errorMessageForDeleting}
        cancel={this.closeDeleteConfirmModal}
        confirmedToDelete={this.deleteComment}
      /> */}
    </>
  );
};

// class DeprecatePageComments extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       // for deleting comment
//       commentToDelete: undefined,
//       isDeleteConfirmModalShown: false,
//       errorMessageForDeleting: undefined,

//       showEditorIds: new Set(),
//     };

//     this.growiRenderer = this.props.appContainer.getRenderer('comment');

//   }

//   confirmToDeleteComment(comment) {
//     this.setState({ commentToDelete: comment });
//     this.showDeleteConfirmModal();
//   }

//   deleteComment() {
//     const comment = this.state.commentToDelete;

//     this.props.commentContainer.deleteComment(comment)
//       .then(() => {
//         this.closeDeleteConfirmModal();
//       })
//       .catch((err) => {
//         this.setState({ errorMessageForDeleting: err.message });
//       });
//   }

//   showDeleteConfirmModal() {
//     this.setState({ isDeleteConfirmModalShown: true });
//   }

//   closeDeleteConfirmModal() {
//     this.setState({
//       commentToDelete: undefined,
//       isDeleteConfirmModalShown: false,
//       errorMessageForDeleting: undefined,
//     });
//   }

//   replyButtonClickedHandler(commentId) {
//     const ids = this.state.showEditorIds.add(commentId);
//     this.setState({ showEditorIds: ids });
//   }

//   editorCancelHandler(commentId) {
//     this.resetEditor(commentId);
//   }

//   editorCommentHandler(commentId) {
//     this.resetEditor(commentId);
//   }

//   resetEditor(commentId) {
//     this.setState((prevState) => {
//       prevState.showEditorIds.delete(commentId);
//       return {
//         showEditorIds: prevState.showEditorIds,
//       };
//     });
//   }

// }
