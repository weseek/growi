import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import UserPicture from '../User/UserPicture';

import CommentEditor from './CommentEditor';

class CommentEditorLazyRenderer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isEditorShown: false,
    };

    this.growiRenderer = this.props.appContainer.getRenderer('comment');

    this.showCommentFormBtnClickHandler = this.showCommentFormBtnClickHandler.bind(this);
  }

  showCommentFormBtnClickHandler() {
    this.setState({ isEditorShown: !this.state.isEditorShown });
  }

  render() {
    const { appContainer } = this.props;
    const username = appContainer.me;
    const isLoggedIn = username != null;
    const user = appContainer.findUser(username);

    const layoutType = this.props.appContainer.getConfig().layoutType;
    const isBaloonStyle = layoutType.match(/crowi-plus|growi|kibela/);

    if (!isLoggedIn) {
      return <React.Fragment></React.Fragment>;
    }

    return (
      <React.Fragment>

        { !this.state.isEditorShown && (
          <div className="form page-comment-form">
            <div className="comment-form">
              { isBaloonStyle && (
                <div className="comment-form-user">
                  <UserPicture user={user} />
                </div>
              ) }
              <div className="comment-form-main">
                { !this.state.isEditorShown && (
                  <button
                    type="button"
                    className={`btn btn-lg ${isBaloonStyle ? 'btn-link' : 'btn-primary'} center-block`}
                    onClick={this.showCommentFormBtnClickHandler}
                  >
                    <i className="icon-bubble"></i> Add Comment
                  </button>
                ) }
              </div>
            </div>
          </div>
        ) }

        { this.state.isEditorShown && (
          <CommentEditor
            growiRenderer={this.growiRenderer}
            replyTo={undefined}
            commentButtonClickedHandler={this.showCommentFormBtnClickHandler}
          >
          </CommentEditor>
        ) }

      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const CommentEditorLazyRendererWrapper = (props) => {
  return createSubscribedElement(CommentEditorLazyRenderer, props, [AppContainer]);
};

CommentEditorLazyRenderer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CommentEditorLazyRendererWrapper;
