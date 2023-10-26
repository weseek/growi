import React, {
  useCallback, useState, useRef, useEffect,
} from 'react';

import { UserPicture } from '@growi/ui/dist/components';
import { useRouter } from 'next/router';
import { debounce } from 'throttle-debounce';

import { IEditorMethods } from '~/interfaces/editor-methods';
import { useSWRxPageComment } from '~/stores/comment';
import { useCurrentUser } from '~/stores/context';

export type InlineCommentEditorProps = {
  pageId: string,
  revisionId: string,
  pageContentsWrapperRef: React.RefObject<HTMLDivElement>,
  onCancel?: () => void,
}

export const InlineCommentEditor = (props: InlineCommentEditorProps): JSX.Element => {

  const {
    pageId, revisionId, pageContentsWrapperRef: pageWrapperRef, onCancel,
  } = props;

  const { data: currentUser } = useCurrentUser();
  const { post: postComment } = useSWRxPageComment(pageId);

  const [comment, setComment] = useState('');
  const [error, setError] = useState();

  const [selectedText, setSelectedText] = useState<string>('');
  const [targetRect, setTargetRect] = useState<DOMRect>();

  const editorRef = useRef<IEditorMethods>(null);

  const inlineCommentBoxRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const onRouterChangeComplete = useCallback(() => {
    editorRef.current?.setValue('');
    // TODO: Remove all selection ranges.
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

  const cancelButtonClickedHandler = useCallback(() => {
    initializeEditor();

    if (onCancel != null) {
      onCancel();
    }
  }, [onCancel, initializeEditor]);

  const onFocusInlineCommentFormHandler = useCallback(() => {
    const sel = document.getSelection();
    if (sel == null || sel?.getRangeAt(0) == null) return;
    const range = sel.getRangeAt(0);
    const innerContents = range.cloneContents();
    for (const childNode of innerContents.childNodes) {
      let newNodeElement;
      if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent != null) {
        newNodeElement = document.createElement('span');
        newNodeElement.innerText = childNode.textContent;
      }
      else {
        newNodeElement = childNode;
      }
      if (newNodeElement != null) {
        newNodeElement.setAttribute('style', 'text-decoration: underline orange solid 4px;'); // Make the background of the range selection blue.
        newNodeElement.setAttribute('selected', 'selected');
        childNode.replaceWith(newNodeElement);
      }
    }
    range.deleteContents(); // Delete range selection.
    range.insertNode(innerContents); // Insert a qualified span from the beginning of the range selection.
    sel.removeAllRanges();
  }, []);

  useEffect(() => {
    if (inlineCommentBoxRef != null && inlineCommentBoxRef.current != null && targetRect != null) {
      const { current } = inlineCommentBoxRef;
      if (current.style != null) {
        const { top, left } = targetRect;
        current.style.top = `${top}px`;
        current.style.left = `${left}px`;
        current.style.transform = 'translateY(-100%)';
      }
    }

  }, [targetRect]);

  const resetSelectionRect = useCallback(() => {
    const sel = document.getSelection();
    if (sel == null || sel.isCollapsed) return; // Escape if selected aria is invalid.
    const range = sel.getRangeAt(0);
    const clientRect = range.getBoundingClientRect();
    setTargetRect(clientRect);
  }, []);

  const domSelectHandler = useCallback(() => {
    const sel = document.getSelection();
    if (sel == null || sel.isCollapsed) return; // Escape if selected aria is invalid.
    const range = sel.getRangeAt(0);
    const rangeContents = range.cloneContents();
    if (rangeContents.textContent != null) {
      setSelectedText(rangeContents.textContent);
    }
    const clientRect = range.getBoundingClientRect();
    setTargetRect(clientRect);
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', resetSelectionRect);
    return document.removeEventListener('scroll', resetSelectionRect);
  }, [resetSelectionRect]);

  useEffect(() => {
    const selectionChangeHandler = debounce(1000, domSelectHandler);
    if (pageWrapperRef != null && pageWrapperRef.current != null) {
      pageWrapperRef.current.addEventListener('selectstart', selectionChangeHandler);
    }
    return () => {
      if (pageWrapperRef != null && pageWrapperRef.current != null) {
        pageWrapperRef.current.removeEventListener('selectstart', selectionChangeHandler);
      }
    };
  }, [domSelectHandler, pageWrapperRef]);

  return (
    <div id="inlineCommentBox" className={`position-fixed ${selectedText === '' && 'd-none'}`} ref={inlineCommentBoxRef}>
      <div className="card">
        <div className="card-body">
          <div className="comment-form-user">
            <UserPicture user={currentUser} noLink noTooltip />
          </div>
          <p>{selectedText}</p>
          <input
            name="inlineComment"
            id="inline-comment"
            className="form-control"
            onInput={(e) => { setComment(e.target.value) /** TODO: Fix lint error */ }}
            onFocus={() => { onFocusInlineCommentFormHandler() }}
            onBlur={() => { cancelButtonClickedHandler() }}
          />
        </div>
        <div className="card-footer d-flex justify-content-end">
          {error}
          <button type="button" onClick={postCommentHandler}>送信</button>
        </div>
      </div>
    </div>
  );

};
