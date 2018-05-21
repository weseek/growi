import React from 'react';
import PropTypes from 'prop-types';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class Comment
 * @extends {React.Component}
 */
export default class CommentForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      isMarkdown: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.postComment = this.postComment.bind(this);
    this.reload = this.reload.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  postComment(event) {
    event.preventDefault();
    this.props.crowi.apiPost('/comments.add', {
      commentForm: {
        comment: this.state.comment,
        _csrf: this.props.crowi.csrfToken,
        page_id: this.props.pageId,
        revision_id: this.props.revisionId,
        is_markdown: this.state.isMarkdown,
      }
    })
      .then(() => {
        this.reload();
      });
  }

  reload() {
    this.props.pageComments.init();
    this.setState({
      comment: '',
      isMarkdown: false,
    });
  }

  render() {
    //{% if not user %}disabled{% endif %}をtextareaとbuttonに追加
    // denounce/throttle
    return (
      <div>
        <form className="form page-comment-form" id="page-comment-form" onSubmit={this.postComment}>
          <div className="comment-form">
            <div className="comment-form-user">
              <img src="{{ user|picture }}" className="picture img-circle" width="25" alt="{{ user.name }}" title="{{ user.name }}" />
            </div>
            <div className="comment-form-main">
              <div className="comment-write" id="comment-write">
                <textarea className="comment-form-comment form-control" id="comment-form-comment" name="comment"
                  required placeholder="Write comments here..." value={this.state.comment} onChange={this.handleChange}></textarea>
                <input type="checkbox" id="comment-form-is-markdown" name="isMarkdown" checked={this.state.isMarkdown} value="1" onChange={this.handleChange} /> Markdown<br />
              </div>
              <div className="comment-submit">
                <div className="pull-right">
                  <span className="text-danger" id="comment-form-message"></span>
                  <button type="submit" value="Submit" id="comment-form-button" className="fcbtn btn btn-sm btn-outline btn-rounded btn-primary btn-1b">
                    Comment
                  </button>
                </div>
                <div className="clearfix"></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

CommentForm.propTypes = {
  pageComments: PropTypes.object.isRequired,
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
};
