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
      isLayoutTypeGrowi: false,
    };

    this.showCommentFormBtnClickHandler = this.showCommentFormBtnClickHandler.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    const layoutType = this.props.appContainer.getConfig().layoutType;
    this.setState({ isLayoutTypeGrowi: layoutType === 'crowi-plus' || layoutType === 'growi' });
  }

  showCommentFormBtnClickHandler() {
    this.setState({ isEditorShown: !this.state.isEditorShown });
  }

  render() {
    const { appContainer } = this.props;
    const username = appContainer.me;
    const user = appContainer.findUser(username);
    const isLayoutTypeGrowi = this.state.isLayoutTypeGrowi;
    return (
      <React.Fragment>
        { !this.state.isEditorShown
          && (
          <div className="form page-comment-form">
            { username
              && (
                <div className="comment-form">
                  { isLayoutTypeGrowi
                  && (
                    <div className="comment-form-user">
                      <UserPicture user={user} />
                    </div>
                  )
                  }
                  <div className="comment-form-main">
                    <button
                      type="button"
                      className={`btn btn-lg ${this.state.isLayoutTypeGrowi ? 'btn-link' : 'btn-primary'} center-block`}
                      onClick={this.showCommentFormBtnClickHandler}
                    >
                      <i className="icon-bubble"></i> Add Comment
                    </button>
                  </div>
                </div>
              )
            }
          </div>
          )
        }
        { this.state.isEditorShown
          && (
          <CommentEditor
            {...this.props}
            replyTo={undefined}
            commentButtonClickedHandler={this.showCommentFormBtnClickHandler}
          >
          </CommentEditor>
)
        }
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
  crowiOriginRenderer: PropTypes.object.isRequired,

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CommentEditorLazyRendererWrapper;
