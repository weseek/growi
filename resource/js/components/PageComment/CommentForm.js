import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import FormControl from 'react-bootstrap/es/FormControl';
import Panel from 'react-bootstrap/es/panel';
import Tab from 'react-bootstrap/es/tab';
import Tabs from 'react-bootstrap/es/tabs';
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
          <div className="comment-write">
            <Tabs defaultActiveKey={1} id="comment-form-tabs">
              <Tab eventKey={1} title="Write">
                <div className="textarea">
                  <textarea className="comment-form-comment form-control" id="comment-form-comment" name="commentForm[comment]" required placeholder="Write comments here..." >
                  </textarea>
                </div>
              </Tab>
              <Tab eventKey={2} title="Prevrew">
                <Panel className="comment-form-preview">
                  Preview
                </Panel>
              </Tab>
            </Tabs>
          </div>
          <div className="comment-submit">
            <input type="checkbox" className="form-check-input" id="checkbox-markdown" />
            <label className="form-check-label" htmlFor="checkbox-markdown">Markdown</label>
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
