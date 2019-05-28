import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import dateFnsFormat from 'date-fns/format';
import CommentForm from './CommentForm';

import RevisionBody from '../Page/RevisionBody';

import ReactUtils from '../ReactUtils';
import UserPicture from '../User/UserPicture';
import Username from '../User/Username';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class Comment
 * @extends {React.Component}
 */
export default class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      showCommentForm: false,
    };

    this.isCurrentUserIsAuthor = this.isCurrentUserEqualsToAuthor.bind(this);
    this.isCurrentRevision = this.isCurrentRevision.bind(this);
    this.getRootClassName = this.getRootClassName.bind(this);
    this.getRevisionLabelClassName = this.getRevisionLabelClassName.bind(this);
    this.deleteBtnClickedHandler = this.deleteBtnClickedHandler.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.showForm = this.showForm.bind(this);
  }

  showForm() {
    this.setState((prevState) => {
      return {
        showCommentForm: !prevState.showCommentForm,
      };
    });
  }

  componentWillMount() {
    this.renderHtml(this.props.comment.comment);
  }

  componentWillReceiveProps(nextProps) {
    this.renderHtml(nextProps.comment.comment);
  }

  // not used
  setMarkdown(markdown) {
    this.renderHtml(markdown);
  }

  isCurrentUserEqualsToAuthor() {
    return this.props.comment.creator.username === this.props.data.crowi.me;
  }

  isCurrentRevision() {
    return this.props.comment.revision === this.props.data.revisionId;
  }

  getRootClassName() {
    return `page-comment ${
      this.isCurrentUserEqualsToAuthor() ? 'page-comment-me ' : ''}`;
  }

  getRevisionLabelClassName() {
    return `page-comment-revision label ${
      this.isCurrentRevision() ? 'label-primary' : 'label-default'}`;
  }

  deleteBtnClickedHandler() {
    this.props.deleteBtnClicked(this.props.comment);
  }

  renderRevisionBody() {
    const config = this.props.data.crowi.getConfig();
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

  renderHtml(markdown) {
    const context = {
      markdown,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.data.crowi.interceptorManager;
    interceptorManager.process('preRenderComment', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = crowiRenderer.process(context.markdown);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = crowiRenderer.postProcess(context.parsedHTML);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderCommentHtml', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderCommentHtml', context) });

  }

  render() {
    const comment = this.props.comment;
    const creator = comment.creator;
    const isMarkdown = comment.isMarkdown;

    const rootClassName = this.getRootClassName();
    const commentDate = dateFnsFormat(comment.createdAt, 'YYYY/MM/DD HH:mm');
    const commentBody = isMarkdown ? this.renderRevisionBody() : ReactUtils.nl2br(comment.comment);
    const revHref = `?revision=${comment.revision}`;
    const revFirst8Letters = comment.revision.substr(-8);
    const revisionLavelClassName = this.getRevisionLabelClassName();

    return (
      <div>
        <div className={rootClassName}>
          <UserPicture user={creator} />
          <div className="page-comment-main">
            <div className="page-comment-creator">
              <Username user={creator} />
            </div>
            <div className="page-comment-body">{commentBody}</div>
            <div className="page-comment-reply text-right">
              {
                comment.replyTo === undefined
                && (
                  <Button
                    type="button"
                    className="fcbtn btn btn-primary btn-sm btn-success btn-rounded btn-1b"
                    onClick={this.showForm}
                  >
                    Reply
                  </Button>
                )
              }
            </div>
            <div className="page-comment-meta">
              {commentDate}&nbsp;
              <a className={revisionLavelClassName} href={revHref}>{revFirst8Letters}</a>
            </div>
            <div className="page-comment-control">
              <button type="button" className="btn btn-link" onClick={this.deleteBtnClickedHandler}>
                <i className="ti-close"></i>
              </button>
            </div>
          </div>
        </div>
        {
          this.state.showCommentForm
          && (
          <CommentForm
            onPostComplete={this.props.onPostComplete}
            data={this.props.data}
            replyTo={comment._id.toString()}
          />
        )
        }
      </div>
    );
  }

}

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  deleteBtnClicked: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  replyTo: PropTypes.string,
  onPostComplete: PropTypes.func.isRequired,
};
