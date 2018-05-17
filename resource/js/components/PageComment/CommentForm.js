import React from 'react';
import PropTypes from 'prop-types';
import FormControl from 'react-bootstrap/es/FormControl';
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
        <a href={creatorsPage}>
        <UserPicture />
        </a>
        <div className="comment-form-main">
          <div className="comment-form-editor">
          </div>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Write comments here..."
            onChange={this.handleChange}
          />
          <div className="form-check">
          <input type="checkbox" className="form-check-input" id="checkbox-markdown"></input>
            <label className="form-check-label" htmlFor="checkbox-markdown">Markdown</label>
          </div>

        </div>
      </div>
    );
  }
}

CommentForm.propTypes = {
};
