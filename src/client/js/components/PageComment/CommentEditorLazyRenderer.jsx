import React from 'react';
import PropTypes from 'prop-types';
import CommentEditor from './CommentEditor';

import UserPicture from '../User/UserPicture';

export default class CommentEditorLazyRenderer extends React.Component {

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
    const layoutType = this.props.crowi.getConfig().layoutType;
    this.setState({ isLayoutTypeGrowi: layoutType === 'crowi-plus' || layoutType === 'growi' });
  }

  showCommentFormBtnClickHandler() {
    this.setState({ isEditorShown: true });
  }

  render() {
    const crowi = this.props.crowi;
    const username = crowi.me;
    const user = crowi.findUser(username);
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
          >
          </CommentEditor>
)
        }
      </React.Fragment>
    );
  }

}

CommentEditorLazyRenderer.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
};
