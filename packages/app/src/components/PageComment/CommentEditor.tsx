import React, {
  useCallback, useState, useRef, useEffect,
} from 'react';

import { UserPicture } from '@growi/ui';
import {
  Button,
  TabContent, TabPane,
} from 'reactstrap';
import * as toastr from 'toastr';

import AppContainer from '~/client/services/AppContainer';
import CommentContainer from '~/client/services/CommentContainer';
import EditorContainer from '~/client/services/EditorContainer';
import PageContainer from '~/client/services/PageContainer';
import GrowiRenderer from '~/client/util/GrowiRenderer';
import { apiPostForm } from '~/client/util/apiv1-client';
import { CustomWindow } from '~/interfaces/global';
import InterceptorManager from '~/services/interceptor-manager';
import { useCurrentPagePath, useCurrentPageId, useCurrentUser } from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import { useIsMobile } from '~/stores/ui';

import { CustomNavTab } from '../CustomNavigation/CustomNav';
import NotAvailableForGuest from '../NotAvailableForGuest';
import Editor from '../PageEditor/Editor';
import { SlackNotification } from '../SlackNotification';
import { withUnstatedContainers } from '../UnstatedUtils';

import CommentPreview from './CommentPreview';


const navTabMapping = {
  comment_editor: {
    Icon: () => <i className="icon-settings" />,
    i18n: 'Write',
    index: 0,
  },
  comment_preview: {
    Icon: () => <i className="icon-settings" />,
    i18n: 'Preview',
    index: 1,
  },
};

type PropsType = {
  appContainer: AppContainer,
  commentContainer: CommentContainer,

  growiRenderer: GrowiRenderer,
  isForNewComment: boolean,
  replyTo: string,
  currrentCommentId: string,
  commentBody: string,
  commentCreator: string,
  onCancelButtonClicked: (id: string) => void,
  onCommentButtonClicked: () => void,

  currentCommentId: string
}

interface ICommentEditorOperation {
  setGfmMode: (value: boolean) => void,
  setValue: (value: string) => void,
  insertText: (text: string) => void,
  terminateUploadingState: () => void,
}

const CommentEditor = (props: PropsType): JSX.Element => {

  const {
    appContainer, commentContainer, growiRenderer, isForNewComment,
    replyTo, currentCommentId, commentBody, commentCreator,
  } = props;
  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPageId } = useCurrentPageId();
  const { data: isMobile } = useIsMobile();
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);

  const config = appContainer.getConfig();
  const isUploadable = config.upload.image || config.upload.file;
  const isUploadableFile = config.upload.file;
  const isSlackConfigured = config.isSlackConfigured;

  const [isReadyToUse, setIsReadyToUse] = useState(isForNewComment);
  const [comment, setComment] = useState(commentBody ?? '');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [html, setHtml] = useState('');
  const [activeTab, setActiveTab] = useState('comment_editor');
  const [error, setError] = useState();
  const [slackChannels, setSlackChannels] = useState(slackChannelsData?.toString());

  const editorRef = useRef<ICommentEditorOperation>(null);

  // TODO: typescriptize Editor
  const AnyEditor = Editor as any;

  const updateState = (value:string) => {
    setComment(value);
  };

  const updateStateCheckbox = (event) => {
    if (editorRef.current == null) { return }
    const value = event.target.checked;
    setIsMarkdown(value);
    // changeMode
    editorRef.current.setGfmMode(value);
  };

  const renderHtml = (markdown: string) => {
    const context = {
      markdown,
      parsedHTML: '',
    };

    const interceptorManager: InterceptorManager = (window as CustomWindow).interceptorManager;
    interceptorManager.process('preRenderCommnetPreview', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown, context);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown, context);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderCommentPreviewHtml', context) })
      .then(() => {
        setHtml(context.parsedHTML);
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderCommentPreviewHtml', context) });
  };

  const handleSelect = (activeTab: string) => {
    setActiveTab(activeTab);
    renderHtml(comment);
  };

  const fetchSlackChannels = (slackChannels: string|undefined) => {
    if (slackChannels === undefined) { return }
    setSlackChannels(slackChannels);
  };

  const onSlackEnabledFlagChange = useCallback((isSlackEnabled) => {
    mutateIsSlackEnabled(isSlackEnabled, false);
  }, [mutateIsSlackEnabled]);

  useEffect(() => {
    // if (this.props.slackChannels !== prevProps.slackChannels) {
    //   this.fetchSlackChannels(this.props.slackChannels);
    // }
    // 実装を考える必要あり
    fetchSlackChannels(slackChannelsData?.toString());
  });

  const onSlackChannelsChange = (slackChannels: string) => {
    setSlackChannels(slackChannels);
  };

  const initializeEditor = () => {
    setComment('');
    setIsMarkdown(true);
    setHtml('');
    setActiveTab('comment_editor');
    setError(undefined);
    // reset value
    if (editorRef.current == null) { return }
    editorRef.current.setValue('');
  };

  const cancelButtonClickedHandler = () => {
    const { onCancelButtonClicked } = props;

    // change state to not ready
    // when this editor is for the new comment mode
    if (isForNewComment) {
      setIsReadyToUse(false);
    }

    if (onCancelButtonClicked != null) {
      onCancelButtonClicked(replyTo || currentCommentId);
    }
  };

  const postComment = async() => {
    const { onCommentButtonClicked } = props;
    try {
      if (currentCommentId != null) {
        await commentContainer.putComment(
          comment,
          isMarkdown,
          currentCommentId,
          commentCreator,
        );
      }
      else {
        await commentContainer.postComment(
          comment,
          isMarkdown,
          replyTo,
          isSlackEnabled,
          slackChannels,
        );
      }
      initializeEditor();

      if (onCommentButtonClicked != null) {
        onCommentButtonClicked();
      }
    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      setError(errorMessage);
    }
  };

  const commentButtonClickedHandler = () => {
    postComment();
  };

  const ctrlEnterHandler = (event) => {
    if (event != null) {
      event.preventDefault();
    }

    postComment();
  };

  const apiErrorHandler = (error) => {
    toastr.error(error.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  };

  const uploadHandler = async(file) => {

    if (editorRef.current == null) { return }

    const pagePath = currentPagePath;
    const pageId = currentPageId;
    const endpoint = '/attachments.add';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', pagePath ?? '');
    formData.append('page_id', pageId ?? '');
    try {
      // TODO: typescriptize res
      const res = await apiPostForm(endpoint, formData) as any;
      const attachment = res.attachment;
      const fileName = attachment.originalName;
      let insertText = `[${fileName}](${attachment.filePathProxied})`;
      // when image
      if (attachment.fileFormat.startsWith('image/')) {
        // modify to "![fileName](url)" syntax
        insertText = `!${insertText}`;
      }
      editorRef.current.insertText(insertText);
    }
    catch (err) {
      apiErrorHandler(err);
    }
    finally {
      editorRef.current.terminateUploadingState();
    }
  };

  const getCommentHtml = () => {
    return (
      <CommentPreview
        html={html}
      />
    );
  };

  const renderBeforeReady = (): JSX.Element => {
    return (
      <div className="text-center">
        <NotAvailableForGuest>
          <button
            type="button"
            className="btn btn-lg btn-link"
            onClick={() => setIsReadyToUse(true)}
          >
            <i className="icon-bubble"></i> Add Comment
          </button>
        </NotAvailableForGuest>
      </div>
    );
  };

  const renderReady = () => {

    const commentPreview = isMarkdown ? getCommentHtml() : null;

    const errorMessage = <span className="text-danger text-right mr-2">{error}</span>;
    const cancelButton = (
      <Button outline color="danger" size="xs" className="btn btn-outline-danger rounded-pill" onClick={cancelButtonClickedHandler}>
        Cancel
      </Button>
    );
    const submitButton = (
      <Button
        outline
        color="primary"
        className="btn btn-outline-primary rounded-pill"
        onClick={commentButtonClickedHandler}
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
              <AnyEditor
                ref={editorRef}
                value={comment}
                isGfmMode={isMarkdown}
                lineNumbers={false}
                isMobile={isMobile}
                isUploadable={isUploadable}
                isUploadableFile={isUploadableFile}
                onChange={updateState}
                onUpload={uploadHandler}
                onCtrlEnter={ctrlEnterHandler}
                isComment
              />
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
            <label className="mr-2">
              {activeTab === 'comment_editor' && (
                <span className="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="comment-form-is-markdown"
                    name="isMarkdown"
                    checked={isMarkdown}
                    value="1"
                    onChange={updateStateCheckbox}
                  />
                  <label
                    className="ml-2 custom-control-label"
                    htmlFor="comment-form-is-markdown"
                  >
                    Markdown
                  </label>
                </span>
              ) }
            </label>
            <span className="flex-grow-1" />
            <span className="d-none d-sm-inline">{ errorMessage && errorMessage }</span>

            { isSlackConfigured
              && (
                <div className="form-inline align-self-center mr-md-2">
                  <SlackNotification
                    isSlackEnabled
                    slackChannels={slackChannelsData?.toString() ?? ''}
                    onEnabledFlagChange={onSlackEnabledFlagChange}
                    onChannelChange={onSlackChannelsChange}
                    id="idForComment"
                  />
                </div>
              )
            }
            <div className="d-none d-sm-block">
              <span className="mr-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
          <div className="d-block d-sm-none mt-2">
            <div className="d-flex justify-content-end">
              { error && errorMessage }
              <span className="mr-2">{cancelButton}</span><span>{submitButton}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="form page-comment-form">
      <div className="comment-form">
        <div className="comment-form-user">
          <UserPicture user={currentUser} noLink noTooltip />
        </div>
        <div className="comment-form-main">
          { !isReadyToUse
            ? renderBeforeReady()
            : renderReady()
          }
        </div>
      </div>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const CommentEditorWrapper = withUnstatedContainers(CommentEditor, [AppContainer, PageContainer, EditorContainer, CommentContainer]);

export default CommentEditorWrapper;
