import React, {
  FC, useEffect, useState, useMemo, memo, useCallback,
} from 'react';

import { UncontrolledTooltip } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import { UserPicture } from '@growi/ui';
import AppContainer from '~/client/services/AppContainer';

import RevisionBody from './Page/RevisionBody';
import Username from './User/Username';
import FormattedDistanceDate from './FormattedDistanceDate';
import HistoryIcon from './Icons/HistoryIcon';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';

import { useSWRxPageComment } from '../stores/comment';

import MathJaxConfigurer from '~/client/util/markdown-it/mathjax';

const COMMENT_BOTTOM_MARGIN = 'mb-5';

type Props = {
  appContainer: AppContainer,
  pageId: string,
  highlightKeywords?:string[],
}

// todo: update this component to shared PageComment component
const PageCommentList:FC<Props> = memo((props:Props):JSX.Element => {

  const { appContainer, pageId, highlightKeywords } = props;

  const { t } = useTranslation();
  const { data: comments, mutate } = useSWRxPageComment(pageId);
  const [formatedComments, setFormatedComments] = useState<ICommentHasIdList | null>(null);

  const commentsFromOldest = useMemo(() => (formatedComments != null ? [...formatedComments].reverse() : null), [formatedComments]);
  const commentsExceptReply: ICommentHasIdList | undefined = useMemo(
    () => commentsFromOldest?.filter(comment => comment.replyTo == null), [commentsFromOldest],
  );
  const allReplies = {};

  /**
   * preprocess:
   * parse, sanitize, convert markdown to html
   */
  const preprocessComment = useCallback(async(comment:string):Promise<string> => {

    const { interceptorManager } = appContainer;
    const growiRenderer = appContainer.getRenderer('comment');

    const context: {markdown: string, parsedHTML: string} = { markdown: comment, parsedHTML: '' };

    if (interceptorManager != null) {
      await interceptorManager.process('preRenderComment', context);
      await interceptorManager.process('prePreProcess', context);
      context.markdown = await growiRenderer.preProcess(context.markdown);
      await interceptorManager.process('postPreProcess', context);
      context.parsedHTML = await growiRenderer.process(context.markdown);
      await interceptorManager.process('prePostProcess', context);
      context.parsedHTML = await growiRenderer.postProcess(context.parsedHTML);
      await interceptorManager.process('postPostProcess', context);
      await interceptorManager.process('preRenderCommentHtml', context);
      await interceptorManager.process('postRenderCommentHtml', context);
    }

    return context.parsedHTML;

  }, [appContainer]);

  const highlightComment = useCallback((comment: string):string => {
    if (highlightKeywords == null) return comment;

    let highlightedComment = '';
    highlightKeywords.forEach((highlightKeyword) => {
      highlightedComment = comment.replaceAll(highlightKeyword, '<em class="highlighted-keyword">$&</em>');
    });
    return highlightedComment;
  }, [highlightKeywords]);

  useEffect(() => { mutate() }, [pageId, mutate]);

  useEffect(() => {
    const formatAndHighlightComments = async() => {

      if (comments != null) {
        const preprocessedCommentList: string[] = await Promise.all(comments.map((comment) => {
          const highlightedComment: string = highlightComment(comment.comment);
          return preprocessComment(highlightedComment);
        }));
        const preprocessedComments: ICommentHasIdList = comments.map((comment, index) => {
          return { ...comment, comment: preprocessedCommentList[index] };
        });
        setFormatedComments(preprocessedComments);
      }

    };

    formatAndHighlightComments();

  }, [comments, highlightComment, preprocessComment]);

  if (commentsFromOldest != null) {
    commentsFromOldest.forEach((comment) => {
      if (comment.replyTo != null) {
        allReplies[comment.replyTo] = allReplies[comment.replyTo] == null ? [comment] : [...allReplies[comment.replyTo], comment];
      }
    });
  }

  const generateMarkdownBody = (comment: string): JSX.Element => {
    const isMathJaxEnabled: boolean = (new MathJaxConfigurer(appContainer)).isEnabled;
    return (
      <RevisionBody
        html={comment}
        isMathJaxEnabled={isMathJaxEnabled}
        renderMathJaxOnInit
        additionalClassName="comment"
      />
    );
  };

  const generateBodyFromPlainText = (comment: string): JSX.Element => {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{comment}</span>;
  };

  const generateCommentInnerElement = (comment: ICommentHasId) => {
    const revisionHref = `/${comment.page}?revision=${comment.revision}`;
    const commentBody: string = comment.comment;
    const formatedCommentBody = comment.isMarkdown ? generateMarkdownBody(commentBody) : generateBodyFromPlainText(commentBody);

    return (
      <div key={comment._id} className="page-comment flex-column page-comment-current page-comment-me">
        <div className="page-comment-writer">
          <UserPicture user={comment.creator} />
        </div>
        <div className="page-comment-main">
          <div className="page-comment-creator">
            <Username user={comment.creator} />
          </div>
          <div className="page-comment-body">
            {formatedCommentBody}
          </div>

          <div className="page-comment-meta">
            <a href={`/${comment.page}#${comment._id}`}>
              <FormattedDistanceDate id={comment._id} date={comment.createdAt} />
            </a>
            <span className="ml-2">
              <a id={`page-comment-revision-${comment._id}`} className="page-comment-revision" href={revisionHref}>
                <HistoryIcon />
              </a>
              <UncontrolledTooltip placement="bottom" fade={false} target={`page-comment-revision-${comment._id}`}>
                {t('page_comment.display_the_page_when_posting_this_comment')}
              </UncontrolledTooltip>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const generateAllRepliesElement = (replyComments: ICommentHasIdList) => {
    return (
      replyComments.map((comment: ICommentHasId, index: number) => {
        const lastIndex: number = replyComments.length - 1;
        const isLastIndex: boolean = index === lastIndex;
        const defaultReplyClasses = 'page-comment-reply ml-4 ml-sm-5 mr-3';
        const replyClasses: string = isLastIndex ? `${defaultReplyClasses} ${COMMENT_BOTTOM_MARGIN}` : defaultReplyClasses;

        return (
          <div key={comment._id} className={replyClasses}>
            {generateCommentInnerElement(comment)}
          </div>
        );

      })
    );
  };


  if (commentsFromOldest == null || commentsExceptReply == null) return <></>;

  return (
    <div className="page-comments-row comment-list border border-top mt-5 px-2">
      <div className="page-comments">
        <h2 className="text-center border-bottom my-4 pb-2"><i className="icon-fw icon-bubbles"></i>Comments</h2>
        <div className="page-comments-list" id="page-comments-list">
          { commentsExceptReply.map((comment, index) => {

            const hasReply: boolean = Object.keys(allReplies).includes(comment._id);
            const defaultCommentThreadClasses = 'page-comment-thread';
            const isLastComment: boolean = index === commentsExceptReply.length - 1;

            let commentThreadClass = '';
            commentThreadClass = hasReply ? `${defaultCommentThreadClasses} page-comment-thread-no-replies` : defaultCommentThreadClasses;
            commentThreadClass = isLastComment ? `${commentThreadClass} ${COMMENT_BOTTOM_MARGIN}` : commentThreadClass;

            return (
              <div key={comment._id} className={commentThreadClass}>
                {/* display comment */}
                {generateCommentInnerElement(comment)}
                {/* display reply comment */}
                {hasReply && generateAllRepliesElement(allReplies[comment._id])}
              </div>
            );

          })}
        </div>
      </div>

    </div>
  );
});


export default PageCommentList;
