import React, { useEffect, useState } from 'react';


import { UserPicture } from '@growi/ui';
import { bool } from 'aws-sdk/clients/redshiftdata';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import ReactMarkdown from 'react-markdown';
import { UncontrolledTooltip } from 'reactstrap';

import { RendererOptions } from '~/services/renderer/renderer';
import {
  useCurrentUser, useRevisionId, useRevisionCreatedAt, useInterceptorManager,
} from '~/stores/context';

import { ICommentHasId } from '../../interfaces/comment';
import FormattedDistanceDate from '../FormattedDistanceDate';
import HistoryIcon from '../Icons/HistoryIcon';
import Username from '../User/Username';

import CommentControl from './CommentControl';
import CommentEditor from './CommentEditor';

type CommentProps = {
  comment: ICommentHasId,
  isReadOnly: bool,
  deleteBtnClicked: () => void,
  onComment: () => void,
  rendererOptions: RendererOptions,
}

export const Comment = (props: CommentProps): JSX.Element => {
  const {
    comment, isReadOnly, deleteBtnClicked, onComment, rendererOptions,
  } = props;
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: revisionId } = useRevisionId();
  const { data: revisionCreatedAt } = useRevisionCreatedAt();
  // const { data: config } = useRendererConfig();
  const { data: interceptorManager } = useInterceptorManager();

  const [markdown, setMarkdown] = useState('');
  const [isReEdit, setIsReEdit] = useState(false);

  const commentId = comment._id;
  const creator = comment.creator;
  const isMarkdown = comment.isMarkdown;
  const createdAt = new Date(comment.createdAt);
  const updatedAt = new Date(comment.updatedAt);
  const isEdited = createdAt < updatedAt;

  const initCurrentRenderingContext = () => {
    const currentRenderingContext = {
      markdown: comment.comment,
    };
  };

  useEffect(() => {
    initCurrentRenderingContext();
    // renderHtml();
    setMarkdown(comment.comment);

    // // render only when props.markdown is updated
    // if (comment !== prevComment) {
    //   initCurrentRenderingContext();
    //   // renderHtml();
    //   setMarkdown(comment.comment.markdown);
    //   return;
    // }

    interceptorManager.process('postRenderCommentHtml', comment.comment);

    isCurrentRevision();
  }, [comment]);

  const isCurrentUserEqualsToAuthor = () => {
    const { creator }: any = comment;

    if (creator == null || currentUser == null) {
      return false;
    }
    return creator.username === currentUser.username;
  };

  const isCurrentRevision = () => {
    return comment.revision === revisionId;
  };

  const getRootClassName = (comment) => {
    let className = 'page-comment flex-column';

    if (comment.revision === revisionId) {
      className += ' page-comment-current';
    }
    else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
      className += ' page-comment-newer';
    }
    else {
      className += ' page-comment-older';
    }

    if (isCurrentUserEqualsToAuthor()) {
      className += ' page-comment-me';
    }

    return className;
  };

  const deleteBtnClickedHandler = (comment) => {
    deleteBtnClicked(comment);
  };

  const renderText = (comment) => {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{comment}</span>;
  };

  const renderRevisionBody = () => {
    return (
      <ReactMarkdown {...rendererOptions} className="comment">
        {markdown}
      </ReactMarkdown>
    );
  };

  // async renderHtml() {
  //   // TODO: Check rendererOptions when remarked.
  //   const { interceptorManager, rendererOptions } = this.props;
  //   const context = this.currentRenderingContext;

  //   await interceptorManager.process('preRenderComment', context);
  //   await interceptorManager.process('prePreProcess', context);
  //   context.markdown = await rendererOptions.preProcess(context.markdown, context);
  //   await interceptorManager.process('postPreProcess', context);
  //   context.parsedHTML = await rendererOptions.process(context.markdown, context);
  //   await interceptorManager.process('prePostProcess', context);
  //   context.parsedHTML = await rendererOptions.postProcess(context.parsedHTML, context);
  //   await interceptorManager.process('postPostProcess', context);
  //   await interceptorManager.process('preRenderCommentHtml', context);
  //   this.setState({ html: context.parsedHTML });
  //   await interceptorManager.process('postRenderCommentHtml', context);
  // }

  const rootClassName = getRootClassName(comment);
  const commentBody = isMarkdown ? renderRevisionBody() : renderText(comment.comment);
  const revHref = `?revision=${comment.revision}`;

  const editedDateId = `editedDate-${comment._id}`;
  const editedDateFormatted = isEdited
    ? format(updatedAt, 'yyyy/MM/dd HH:mm')
    : null;

  return (
    <React.Fragment>
      {(isReEdit && !isReadOnly) ? (
        <CommentEditor
          rendererOptions={rendererOptions}
          currentCommentId={commentId}
          commentBody={comment.comment}
          replyTo={undefined}
          commentCreator={creator?.username}
          onCancelButtonClicked={() => setIsReEdit(false)}
          onCommentButtonClicked={() => {
            setIsReEdit(false);
            if (onComment != null) onComment();
          }}
        />
      ) : (
        <div id={commentId} className={rootClassName}>
          <div className="page-comment-writer">
            <UserPicture user={creator} />
          </div>
          <div className="page-comment-main">
            <div className="page-comment-creator">
              <Username user={creator} />
            </div>
            <div className="page-comment-body">{commentBody}</div>
            <div className="page-comment-meta">
              <a href={`#${commentId}`}>
                <FormattedDistanceDate id={commentId} date={comment.createdAt} />
              </a>
              { isEdited && (
                <>
                  <span id={editedDateId}>&nbsp;(edited)</span>
                  <UncontrolledTooltip placement="bottom" fade={false} target={editedDateId}>{editedDateFormatted}</UncontrolledTooltip>
                </>
              )}
              <span className="ml-2">
                <a id={`page-comment-revision-${commentId}`} className="page-comment-revision" href={revHref}>
                  <HistoryIcon />
                </a>
                <UncontrolledTooltip placement="bottom" fade={false} target={`page-comment-revision-${commentId}`}>
                  {t('page_comment.display_the_page_when_posting_this_comment')}
                </UncontrolledTooltip>
              </span>
            </div>
            {(isCurrentUserEqualsToAuthor() && !isReadOnly) && (
              <CommentControl
                onClickDeleteBtn={deleteBtnClickedHandler}
                onClickEditBtn={() => setIsReEdit(true)}
              />
            ) }
          </div>
        </div>
      )
      }
    </React.Fragment>
  );
};
