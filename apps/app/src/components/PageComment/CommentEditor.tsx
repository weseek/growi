import React, {
  useCallback, useState, useRef, useEffect,
} from 'react';

import {
  CodeMirrorEditorComment, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated, useResolvedThemeForEditor,
} from '@growi/editor';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Button, TabContent, TabPane,
} from 'reactstrap';

import { apiv3Get, apiv3PostForm } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import type { IEditorMethods } from '~/interfaces/editor-methods';
import { useSWRxPageComment, useSWRxEditingCommentsNum } from '~/stores/comment';
import {
  useCurrentUser, useIsSlackConfigured, useAcceptedUploadFileType,
} from '~/stores/context';
import {
  useSWRxSlackChannels, useIsSlackEnabled, useIsEnabledUnsavedWarning, useEditorSettings,
} from '~/stores/editor';
import { useCurrentPagePath } from '~/stores/page';
import { useNextThemes } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';

import { CustomNavTab } from '../CustomNavigation/CustomNav';
import { NotAvailableForGuest } from '../NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '../NotAvailableForReadOnlyUser';

import { CommentPreview } from './CommentPreview';

import '@growi/editor/dist/style.css';
import styles from './CommentEditor.module.scss';


const logger = loggerFactory('growi:components:CommentEditor');


const SlackNotification = dynamic(() => import('../SlackNotification').then(mod => mod.SlackNotification), { ssr: false });


const navTabMapping = {
  comment_editor: {
    Icon: () => <span className="material-symbols-outlined">edit_square</span>,
    i18n: 'Write',
  },
  comment_preview: {
    Icon: () => <span className="material-symbols-outlined">play_arrow</span>,
    i18n: 'Preview',
  },
};

export type CommentEditorProps = {
  pageId: string,
  isForNewComment?: boolean,
  replyTo?: string,
  revisionId: string,
  currentCommentId?: string,
  commentBody?: string,
  onCancelButtonClicked?: () => void,
  onCommentButtonClicked?: () => void,
}


export const CommentEditor = (props: CommentEditorProps): JSX.Element => {

  const {
    pageId, isForNewComment, replyTo, revisionId,
    currentCommentId, commentBody, onCancelButtonClicked, onCommentButtonClicked,
  } = props;

  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { update: updateComment, post: postComment } = useSWRxPageComment(pageId);
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();
  const { data: acceptedUploadFileType } = useAcceptedUploadFileType();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { data: editorSettings } = useEditorSettings();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const {
    increment: incrementEditingCommentsNum,
    decrement: decrementEditingCommentsNum,
  } = useSWRxEditingCommentsNum();
  const { mutate: mutateResolvedTheme } = useResolvedThemeForEditor();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.COMMENT);
  const { resolvedTheme } = useNextThemes();
  mutateResolvedTheme({ themeData: resolvedTheme });

  const [isReadyToUse, setIsReadyToUse] = useState(!isForNewComment);
  const [comment, setComment] = useState(commentBody ?? '');
  const [activeTab, setActiveTab] = useState('comment_editor');
  const [error, setError] = useState();
  const [slackChannels, setSlackChannels] = useState<string>('');
  const [incremented, setIncremented] = useState(false);

  const editorRef = useRef<IEditorMethods>(null);

  const router = useRouter();
  const { t } = useTranslation('commons');

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

  const handleSelect = useCallback((activeTab: string) => {
    setActiveTab(activeTab);
  }, []);

  // DO NOT dependent on slackChannelsData directly: https://github.com/weseek/growi/pull/7332
  const slackChannelsDataString = slackChannelsData?.toString();
  const initializeSlackEnabled = useCallback(() => {
    setSlackChannels(slackChannelsDataString ?? '');
    mutateIsSlackEnabled(false);
  }, [mutateIsSlackEnabled, slackChannelsDataString]);

  useEffect(() => {
    initializeSlackEnabled();
  }, [initializeSlackEnabled]);

  const isSlackEnabledToggleHandler = (isSlackEnabled: boolean) => {
    mutateIsSlackEnabled(isSlackEnabled, false);
  };

  const slackChannelsChangedHandler = useCallback((slackChannels: string) => {
    setSlackChannels(slackChannels);
  }, []);

  const initializeEditor = useCallback(async() => {
    const editingCommentsNum = comment !== '' ? await decrementEditingCommentsNum() : undefined;

    setComment('');
    setActiveTab('comment_editor');
    setError(undefined);
    initializeSlackEnabled();
    // reset value
    if (editorRef.current == null) { return }
    editorRef.current.setValue('');

    if (editingCommentsNum != null && editingCommentsNum === 0) {
      mutateIsEnabledUnsavedWarning(false); // must be after clearing comment or else onChange will override bool
    }

  }, [initializeSlackEnabled, comment, decrementEditingCommentsNum, mutateIsEnabledUnsavedWarning]);

  const cancelButtonClickedHandler = useCallback(() => {
    // change state to not ready
    // when this editor is for the new comment mode
    if (isForNewComment) {
      setIsReadyToUse(false);
    }

    initializeEditor();

    if (onCancelButtonClicked != null) {
      onCancelButtonClicked();
    }
  }, [isForNewComment, onCancelButtonClicked, initializeEditor]);

  const postCommentHandler = useCallback(async() => {
    try {
      if (currentCommentId != null) {
        // update current comment
        await updateComment(comment, revisionId, currentCommentId);
      }
      else {
        // post new comment
        const postCommentArgs = {
          commentForm: {
            comment,
            revisionId,
            replyTo,
          },
          slackNotificationForm: {
            isSlackEnabled,
            slackChannels,
          },
        };
        await postComment(postCommentArgs);
      }

      initializeEditor();

      if (onCommentButtonClicked != null) {
        onCommentButtonClicked();
      }

      // Insert empty string as new comment editor is opened after comment
      codeMirrorEditor?.initDoc('');
    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      setError(errorMessage);
    }
  }, [
    currentCommentId, initializeEditor, onCommentButtonClicked, codeMirrorEditor,
    updateComment, comment, revisionId, replyTo, isSlackEnabled, slackChannels, postComment,
  ]);

  // the upload event handler
  const uploadHandler = useCallback((files: File[]) => {
    files.forEach(async(file) => {
      try {
        const { data: resLimit } = await apiv3Get('/attachment/limit', { fileSize: file.size });

        if (!resLimit.isUploadable) {
          throw new Error(resLimit.errorMessage);
        }

        const formData = new FormData();
        formData.append('file', file);
        if (pageId != null) {
          formData.append('page_id', pageId);
        }

        const { data: resAdd } = await apiv3PostForm('/attachment', formData);

        const attachment = resAdd.attachment;
        const fileName = attachment.originalName;

        let insertText = `[${fileName}](${attachment.filePathProxied})\n`;
        // when image
        if (attachment.fileFormat.startsWith('image/')) {
          // modify to "![fileName](url)" syntax
          insertText = `!${insertText}`;
        }

        codeMirrorEditor?.insertText(insertText);
      }
      catch (e) {
        logger.error('failed to upload', e);
        toastError(e);
      }
    });

  }, [codeMirrorEditor, pageId]);

  const getCommentHtml = useCallback(() => {
    if (currentPagePath == null) {
      return <></>;
    }

    return <CommentPreview markdown={comment} />;
  }, [currentPagePath, comment]);

  const renderBeforeReady = useCallback((): JSX.Element => {
    return (
      <div className="text-center">
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              type="button"
              className="btn btn-lg btn-link"
              onClick={() => setIsReadyToUse(true)}
              data-testid="open-comment-editor-button"
            >
              <span className="material-symbols-outlined">comment</span> { t('comment.add_comment')}
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      </div>
    );
  }, []);

  // const onChangeHandler = useCallback((newValue: string, isClean: boolean) => {
  //   setComment(newValue);
  //   if (!isClean && !incremented) {
  //     incrementEditingCommentsNum();
  //     setIncremented(true);
  //   }
  //   mutateIsEnabledUnsavedWarning(!isClean);
  // }, [mutateIsEnabledUnsavedWarning, incrementEditingCommentsNum, incremented]);

  const onChangeHandler = useCallback((newValue: string) => {
    setComment(newValue);

    if (!incremented) {
      incrementEditingCommentsNum();
      setIncremented(true);
    }
  }, [incrementEditingCommentsNum, incremented]);

  // initialize CodeMirrorEditor
  useEffect(() => {
    if (commentBody == null) {
      return;
    }
    codeMirrorEditor?.initDoc(commentBody);
  }, [codeMirrorEditor, commentBody]);


  const renderReady = () => {
    const commentPreview = getCommentHtml();

    const errorMessage = <span className="text-danger text-end me-2">{error}</span>;
    const cancelButton = (
      <Button
        outline
        color="danger"
        size="xs"
        className="btn btn-outline-danger rounded-pill"
        onClick={cancelButtonClickedHandler}
      >
        Cancel
      </Button>
    );
    const submitButton = (
      <Button
        data-testid="comment-submit-button"
        outline
        color="primary"
        className="btn btn-outline-primary rounded-pill"
        onClick={postCommentHandler}
      >
        Comment
      </Button>
    );

    return (
      <>
        <div className="comment-write">
          <CustomNavTab activeTab={activeTab} navTabMapping={navTabMapping} onNavSelected={handleSelect} hideBorderBottom />
          <TabContent activeTab={activeTab}>
            <TabPane tabId="comment_editor">
              <CodeMirrorEditorComment
                acceptedUploadFileType={acceptedUploadFileType}
                onChange={onChangeHandler}
                onSave={postCommentHandler}
                onUpload={uploadHandler}
                editorSettings={editorSettings}
              />
              {/* <Editor
                ref={editorRef}
                value={commentBody ?? ''} // DO NOT use state
                isUploadable={isUploadable}
                isUploadAllFileAllowed={isUploadAllFileAllowed}
                onChange={onChangeHandler}
                onUpload={uploadHandler}
                onCtrlEnter={ctrlEnterHandler}
                isComment
              /> */}
              {/*
                Note: <OptionsSelector /> is not optimized for ComentEditor in terms of responsive design.
                See a review comment in https://github.com/weseek/growi/pull/3473
              */}
            </TabPane>
            <TabPane tabId="comment_preview">
              <div className="comment-form-preview">
                {commentPreview}
              </div>
            </TabPane>
          </TabContent>
        </div>

        <div className="comment-submit">
          <div className="d-flex">
            <span className="flex-grow-1" />
            <span className="d-none d-sm-inline">{errorMessage && errorMessage}</span>

            {isSlackConfigured && isSlackEnabled != null
              && (
                <div className="align-self-center me-md-2">
                  <SlackNotification
                    isSlackEnabled={isSlackEnabled}
                    slackChannels={slackChannels}
                    onEnabledFlagChange={isSlackEnabledToggleHandler}
                    onChannelChange={slackChannelsChangedHandler}
                    id="idForComment"
                  />
                </div>
              )
            }
            <div className="d-none d-sm-block">
              <span className="me-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
          <div className="d-block d-sm-none mt-2">
            <div className="d-flex justify-content-end">
              {error && errorMessage}
              <span className="me-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`${styles['comment-editor-styles']} form page-comment-form`}>
      <div className="comment-form">
        <div className="comment-form-user">
          <UserPicture user={currentUser} noLink noTooltip />
        </div>
        <div className="comment-form-main">
          {isReadyToUse
            ? renderReady()
            : renderBeforeReady()
          }
        </div>
      </div>
    </div>
  );

};
