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

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {

    const creator = "yusuketk";
    const creatorsPage = `/user/${creator}`;

    return (
      <div className="comment-form">
        <div className="comment-form-user">
          <a href={creatorsPage}>
            <UserPicture />
          </a>
        </div>
        <div className="comment-form-main">
          <div className="comment-form-editor">
            <FormControl
            type="text"
            className="comment-form-comment form-control"
            value={this.state.value}
            required
            placeholder="Write comments here..."
            onChange={this.handleChange}
          />
            <div className="form-check">
            <input type="checkbox" className="form-check-input" id="checkbox-markdown"></input>
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
