import React from 'react';

import { UserPicture } from '@growi/ui';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';
import { useCurrentUser, useCurrentPagePath } from '~/stores/context';

import FormattedDistanceDate from '../FormattedDistanceDate';
import HistoryIcon from '../Icons/HistoryIcon';
import RevisionBody from '../Page/RevisionBody';
import { withUnstatedContainers } from '../UnstatedUtils';
import Username from '../User/Username';

import CommentControl from './CommentControl';
import CommentEditor from './CommentEditor';


/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class Comment
 * @extends {React.Component}
 */
class Comment extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isReEdit: false,
    };

    this.isCurrentUserIsAuthor = this.isCurrentUserEqualsToAuthor.bind(this);
    this.isCurrentRevision = this.isCurrentRevision.bind(this);
    this.getRootClassName = this.getRootClassName.bind(this);
    this.deleteBtnClickedHandler = this.deleteBtnClickedHandler.bind(this);
    this.renderText = this.renderText.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
  }


  initCurrentRenderingContext() {
    this.currentRenderingContext = {
      markdown: this.props.comment.comment,
      pagePath: this.props.currentPath,
    };
  }

  componentDidMount() {
    this.initCurrentRenderingContext();
    this.renderHtml();
  }

  componentDidUpdate(prevProps) {
    const { comment: prevComment } = prevProps;
    const { comment } = this.props;

    // render only when props.markdown is updated
    if (comment !== prevComment) {
      this.initCurrentRenderingContext();
      this.renderHtml();
      return;
    }

    const { interceptorManager } = window;

    interceptorManager.process('postRenderCommentHtml', this.currentRenderingContext);
  }

  isCurrentUserEqualsToAuthor() {
    const { comment, currentUser } = this.props;
    const { creator } = comment;

    if (creator == null || currentUser == null) {
      return false;
    }
    return creator.username === currentUser.username;
  }

  isCurrentRevision() {
    return this.props.comment.revision === this.props.pageContainer.state.revisionId;
  }

  getRootClassName(comment) {
    let className = 'page-comment flex-column';

    const { revisionId, revisionCreatedAt } = this.props.pageContainer.state;
    if (comment.revision === revisionId) {
      className += ' page-comment-current';
    }
    else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
      className += ' page-comment-newer';
    }
    else {
      className += ' page-comment-older';
    }

    if (this.isCurrentUserEqualsToAuthor()) {
      className += ' page-comment-me';
    }

    return className;
  }

  deleteBtnClickedHandler() {
    this.props.deleteBtnClicked(this.props.comment);
  }

  renderText(comment) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{comment}</span>;
  }

  renderRevisionBody() {
    const config = this.props.appContainer.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;
    return (
      <RevisionBody
        html={this.state.html}
        isMathJaxEnabled={isMathJaxEnabled}
        renderMathJaxOnInit
        additionalClassName="comment"
      />
    );
  }

  async renderHtml() {

    const { growiRenderer, appContainer } = this.props;
    const { interceptorManager } = window;
    const context = this.currentRenderingContext;

    await interceptorManager.process('preRenderComment', context);
    await interceptorManager.process('prePreProcess', context);
    context.markdown = await growiRenderer.preProcess(context.markdown, context);
    await interceptorManager.process('postPreProcess', context);
    context.parsedHTML = await growiRenderer.process(context.markdown, context);
    await interceptorManager.process('prePostProcess', context);
    context.parsedHTML = await growiRenderer.postProcess(context.parsedHTML, context);
    await interceptorManager.process('postPostProcess', context);
    await interceptorManager.process('preRenderCommentHtml', context);
    this.setState({ html: context.parsedHTML });
    await interceptorManager.process('postRenderCommentHtml', context);
  }

  render() {
    const {
      t, comment, isReadOnly, onComment,
    } = this.props;
    const commentId = comment._id;
    const creator = comment.creator;
    const isMarkdown = comment.isMarkdown;
    const createdAt = new Date(comment.createdAt);
    const updatedAt = new Date(comment.updatedAt);
    const isEdited = createdAt < updatedAt;

    const rootClassName = this.getRootClassName(comment);
    const commentBody = isMarkdown ? this.renderRevisionBody() : this.renderText(comment.comment);
    const revHref = `?revision=${comment.revision}`;

    const editedDateId = `editedDate-${comment._id}`;
    const editedDateFormatted = isEdited
      ? format(updatedAt, 'yyyy/MM/dd HH:mm')
      : null;

    return (
      <React.Fragment>
        {(this.state.isReEdit && !isReadOnly) ? (
          <CommentEditor
            growiRenderer={this.props.growiRenderer}
            currentCommentId={commentId}
            commentBody={comment.comment}
            replyTo={undefined}
            commentCreator={creator?.username}
            onCancelButtonClicked={() => this.setState({ isReEdit: false })}
            onCommentButtonClicked={() => {
              this.setState({ isReEdit: false });
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
              {(this.isCurrentUserEqualsToAuthor() && !isReadOnly) && (
                <CommentControl
                  onClickDeleteBtn={this.deleteBtnClickedHandler}
                  onClickEditBtn={() => this.setState({ isReEdit: true })}
                />
              ) }
            </div>
          </div>
        )
        }
      </React.Fragment>
    );
  }

}

Comment.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  comment: PropTypes.object.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  growiRenderer: PropTypes.object.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  currentPath: PropTypes.string,
  onComment: PropTypes.func,
};

const CommentWrapperFC = (props) => {
  const { t } = useTranslation();

  const { data: currentUser } = useCurrentUser();
  const { data: currentPath } = useCurrentPagePath();

  return <Comment t={t} currentUser={currentUser} currentPath={currentPath} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const CommentWrapper = withUnstatedContainers(CommentWrapperFC, [AppContainer, PageContainer]);

export default CommentWrapper;
