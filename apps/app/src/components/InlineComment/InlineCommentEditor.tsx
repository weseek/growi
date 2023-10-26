import React, {
  useCallback, useState, useRef, useEffect,
} from 'react';

import { UserPicture } from '@growi/ui/dist/components';
import { useRouter } from 'next/router';

import { IEditorMethods } from '~/interfaces/editor-methods';
import { useSWRxPageComment } from '~/stores/comment';
import { useCurrentUser } from '~/stores/context';

export type InlineCommentEditorProps = {
  pageId: string,
  revisionId: string,
  selectedText: string,
  targetRect: DOMRect,
}

export const InlineCommentEditor = (props: InlineCommentEditorProps): JSX.Element => {

  const {
    targetRect, selectedText, pageId, revisionId,
  } = props;

  const { data: currentUser } = useCurrentUser();
  const { post: postComment } = useSWRxPageComment(pageId);

  const [comment, setComment] = useState('');
  const [error, setError] = useState();

  const editorRef = useRef<IEditorMethods>(null);

  const inlineCommentBoxRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // UnControlled CodeMirror value is not reset on page transition, so explicitly set the value to the initial value
  const onRouterChangeComplete = useCallback(() => {
    editorRef.current?.setValue('');
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', onRouterChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', onRouterChangeComplete);
    };
  }, [onRouterChangeComplete, router.events]);

  const initializeEditor = useCallback(async() => {
    setComment('');
    setError(undefined);
    // reset value
    if (editorRef.current == null) { return }
    editorRef.current.setValue('');
  }, []);

  const postCommentHandler = useCallback(async() => {
    const selectedTextIncludedComment = `> ${selectedText}  \n\n ${comment}`;
    try {
      // post new comment
      const postCommentArgs = {
        commentForm: {
          comment: selectedTextIncludedComment,
          revisionId,
          replyTo: undefined, // Always no reply.
        },
        slackNotificationForm: { // no notifications.
          isSlackEnabled: false,
          slackChannels: undefined,
        },
      };
      await postComment(postCommentArgs);

      initializeEditor();
    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      setError(errorMessage);
    }
  }, [comment, initializeEditor, postComment, revisionId, selectedText]);

  // const cancelButtonClickedHandler = useCallback(() => {
  //   initializeEditor();

  //   if (onCancelButtonClicked != null) {
  //     onCancelButtonClicked();
  //   }
  // }, [isForNewComment, onCancelButtonClicked, initializeEditor]);

  const ctrlEnterHandler = useCallback((event) => {
    if (event != null) {
      event.preventDefault();
    }

    postCommentHandler();
  }, [postCommentHandler]);

  useEffect(() => {
    if (inlineCommentBoxRef != null && inlineCommentBoxRef.current != null && targetRect != null) {
      const { current } = inlineCommentBoxRef;
      if (current.style != null) {
        const { top, left } = targetRect;
        console.log(current.style.top, targetRect.top);
        // const { width, height } = current.style;
        console.log('changing styles');
        current.style.top = `${top}px`;
        current.style.left = `${left}px`;
        current.style.transform = 'translateY(-100%)';
      }
    }

  }, []);

  return (
    <div id="inlineCommentBox" className={`position-fixed ${selectedText === '' && 'd-none'}`} ref={inlineCommentBoxRef}>
      <div className="card">
        <div className="card-body">
          <div className="comment-form-user">
            <UserPicture user={currentUser} noLink noTooltip />
          </div>
          <p>{selectedText}</p>
          <textarea
            name="comment-body"
            id="comment-body"
            cols={30}
            rows={1}
            className="form-control"
            onInput={(e) => {
              console.log('input changes', e.target.value);
              setComment(e.target.value);
            }}
            onCtrlEnter={ctrlEnterHandler}
          >
          </textarea>
        </div>
        <div className="card-footer d-flex justify-content-end">
          {error}
          <button type="button" onClick={postCommentHandler}>送信</button>
        </div>
      </div>
    </div>
  );

};
