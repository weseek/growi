import React from 'react';
import PropTypes from 'prop-types';
import CommentEditor from './CommentEditor';

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
    return (
      <React.Fragment>
        { !this.state.isEditorShown
          && (
          <button
            type="button"
            className={`btn btn-lg ${this.state.isLayoutTypeGrowi ? 'btn-link' : 'btn-primary'} center-block`}
            onClick={this.showCommentFormBtnClickHandler}
          >
            <i className="icon-bubble"></i> Add Comment
          </button>
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
