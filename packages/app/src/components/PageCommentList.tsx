import React, {
  FC, useEffect, useState, useMemo, memo, useCallback,
} from 'react';

import { UserPicture } from '@growi/ui';
import AppContainer from '~/client/services/AppContainer';

import RevisionBody from './Page/RevisionBody';
import Username from './User/Username';
import FormattedDistanceDate from './FormattedDistanceDate';
import HistoryIcon from './Icons/HistoryIcon';

import { ICommentHasId, ICommentHasIdList } from '../interfaces/comment';

import { useSWRxPageComment } from '../stores/comment';

import MathJaxConfigurer from '~/client/util/markdown-it/mathjax';


type Props = {
  appContainer: AppContainer,
  pageId: string,
  highlightKeywords?:string[],
}

// todo: update this component to shared PageComment component
const PageCommentList:FC<Props> = memo((props:Props):JSX.Element => {

  const { appContainer, pageId, highlightKeywords } = props;

  const { data: comments, mutate } = useSWRxPageComment(pageId);
  const [formatedComments, setFormatedComments] = useState <ICommentHasIdList | null>(null);

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
          comment.comment = preprocessedCommentList[index];
          return comment;
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
    const commentBody: string = comment.comment;
    const formatedCommentBody = comment.isMarkdown ? generateMarkdownBody(commentBody) : generateBodyFromPlainText(commentBody);

    return (
      <>
        <div className="flex-shrink-0">
          <UserPicture user={comment.creator} size="md" noLink noTooltip />
        </div>
        <div className="flex-grow-1 ml-3">
          <div className="d-flex">
            <div className="flex-shrink-0">
              <Username user={comment.creator} />
            </div>
            <div className="flex-grow-1 ml-3 text-right">
              <div className="page-comment-meta">
                <HistoryIcon />
                <a href={`#${comment._id}`}>
                  <FormattedDistanceDate id={comment._id} date={comment.createdAt} />
                </a>
              </div>
            </div>
          </div>
          <div className="page-comment-body">{formatedCommentBody}</div>
        </div>
      </>
    );
  };

  const generateAllRepliesElement = (replyComments: ICommentHasIdList) => {
    return (
      replyComments.map((comment: ICommentHasId, index: number) => {
        const lastIndex: number = replyComments.length - 1;
        const isLastIndex: boolean = index === lastIndex;

        return (
          <div key={comment._id} className={`d-flex ml-4 ${isLastIndex ? 'mb-5' : 'mb-3'}`}>
            {generateCommentInnerElement(comment)}
          </div>
        );

      })
    );
  };


  if (commentsFromOldest == null || commentsExceptReply == null) return <></>;

  return (
    <div className="comment-list border border-top mt-5 px-2">
      <h2 className="my-3 text-center"><i className="icon-fw icon-bubbles"></i>Comments</h2>

      { commentsExceptReply.map((comment) => {

        const hasReply: boolean = Object.keys(allReplies).includes(comment._id);

        return (
          <div key={comment._id} className="age-comment-main">
            {/* display comment */}
            <div className={`d-flex ${hasReply ? 'mb-3' : 'mb-5'}`}>
              {generateCommentInnerElement(comment)}
            </div>
            {/* display reply comment */}
            {hasReply && generateAllRepliesElement(allReplies[comment._id])}
          </div>
        );
      })}

    </div>
  );
});


export default PageCommentList;
