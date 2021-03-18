import React, {
  useCallback, useMemo, useState, VFC,
} from 'react';
import { format } from 'date-fns';

import { UncontrolledTooltip } from 'reactstrap';

import { Comment as IComment } from '~/interfaces/page';
import { useTranslation } from '~/i18n';
import { usePreviewRenderer } from '~/stores/renderer';
import { useCurrentUser } from '~/stores/context';
import { useCurrentPageSWR } from '~/stores/page';

import FormattedDistanceDate from '~/client/js/components/FormattedDistanceDate';
import UserPicture from '~/client/js/components/User/UserPicture';
import { Username } from '~/components/User/Username';
import RevisionRenderer from '~/client/js/components/Page/RevisionRenderer';
// import CommentEditor from './CommentEditor';
// import CommentControl from './CommentControl';
// import HistoryIcon from '~/client/js/components/Icons/HistoryIcon';

type Props = {
  comment: IComment,
}

export const Comment:VFC<Props> = (props:Props) => {
  const [isReEdit] = useState(false);

  const { comment } = props;

  const { t } = useTranslation();
  const { data: renderer } = usePreviewRenderer();

  const { data: currentUser } = useCurrentUser();
  const { data: currentPage } = useCurrentPageSWR();
  const revision = currentPage?.revision;

  const renderRevisionBody = useCallback(() => {

    if (renderer == null || comment.comment == null) {
      return <></>;
    }
    // TODO implement
    // const config = this.props.appContainer.getConfig();
    // const isMathJaxEnabled = !!config.env.MATHJAX;
    // const isMathJaxEnabled = false;
    return (
      <RevisionRenderer
        renderer={renderer}
        markdown={comment.comment}
      />
    );
  }, [comment.comment, renderer]);

  const renderText = useCallback(() => {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</span>;
  }, [comment.comment]);

  const commentBody = comment.isMarkdown ? renderRevisionBody() : renderText();
  const isEdited = comment.createdAt < comment.updatedAt;
  const editedDateId = `editedDate-${comment._id}`;
  const editedDateFormatted = isEdited ? format(comment.updatedAt, 'yyyy/MM/dd HH:mm') : null;
  const revHref = `?revision=${comment.revision}`;

  const isCurrentUserEqualsToAuthor:boolean = useMemo(() => {
    const { creator } = comment;
    if (creator == null || currentUser == null) {
      return false;
    }
    return creator.username === currentUser.username;
  }, [comment, currentUser]);

  const rootClassName:string = useMemo(() => {
    const classNames:Array<string> = ['page-comment flex-column'];

    if (revision == null) {
      return classNames.join(' ');
    }

    if (comment.revision._id === revision._id) {
      classNames.push('page-comment-current');
    }
    else if (Date.parse(comment.createdAt.toString()) / 1000 > Date.parse(revision.createdAt.toString())) {
      classNames.push('page-comment-newer');
    }
    else {
      classNames.push('page-comment-older');
    }

    if (isCurrentUserEqualsToAuthor) {
      classNames.push('page-comment-me');
    }

    return classNames.join(' ');
  }, [revision, comment.revision._id, comment.createdAt, isCurrentUserEqualsToAuthor]);

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
            <div className="page-comment-writer">
              <UserPicture user={comment.creator} />
            </div>
            <div className="page-comment-main">
              <div className="page-comment-creator">
                <Username user={comment.creator} />
              </div>
              <div className="page-comment-body">{commentBody}</div>
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
                <span className="ml-2">
                  <a id={`page-comment-revision-${comment._id}`} className="page-comment-revision" href={revHref}>
                    {/* TODO fix icon size */}
                    {/* <HistoryIcon /> */}
                  </a>
                  <UncontrolledTooltip placement="bottom" fade={false} target={`page-comment-revision-${comment._id}`}>
                    {t('page_comment.display_the_page_when_posting_this_comment')}
                  </UncontrolledTooltip>
                </span>
              </div>
              {/* TODO GW-5317 implement CommentControl */}
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
