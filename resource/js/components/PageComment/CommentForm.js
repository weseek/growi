import React from 'react';
import PropTypes from 'prop-types';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import UserPicture from '../User/UserPicture';

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
      value: ''
    };
  }

  render() {

    return (
      <div className="comment-form">
        <div className="comment-form-user">
        </div>
        <div className="comment-form-main">
          <div className="comment-write comment-form-editor">
            <textarea className="comment-form-comment form-control" id="comment-form-comment" name="commentForm[comment]" required placeholder="Write comments here..." >
            </textarea>
            <div className="form-check">
            <input type="checkbox" className="form-check-input" id="checkbox-markdown" />
              <label className="form-check-label" htmlFor="checkbox-markdown">Markdown</label>
            </div>
          </div>
          <div className="comment-submit">
            <div className="pull-right">
              <Button bsStyle="primary" className="fcbtn btn btn-sm btn-primary btn-outline btn-rounded btn-1b">
                  Comment
              </Button>
            </div>
            <div className="clearfix">
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CommentForm.propTypes = {
};
