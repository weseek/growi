import React from 'react';
import PropTypes from 'prop-types';
import ReactUtils from '../ReactUtils';

import CommentPreview from '../PageComment/CommentPreview';

import Button from 'react-bootstrap/es/Button';
import Tab from 'react-bootstrap/es/Tab';
import Tabs from 'react-bootstrap/es/Tabs';
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
      comment: '',
      isMarkdown: true,
      html: '',
      key: 1,
    };

    this.updateState = this.updateState.bind(this);
    this.postComment = this.postComment.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  updateState(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSelect(key) {
    this.setState({ key });
    this.renderHtml(this.state.comment);
  }

  /**
   * Load data of comments and rerender <PageComments />
   */
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
      .then((res) => {
        if (this.props.onPostComplete != null) {
          this.props.onPostComplete(res.comment);
        }
        this.setState({
          comment: '',
          isMarkdown: true,
          html: '',
          key: 1,
        });
      });
  }

  getCommentHtml() {
    return (
      <CommentPreview
        html={this.state.html}
        inputRef={el => this.previewElement = el}/>
    );
  }

  renderHtml(markdown) {
    var context = {
      markdown,
      dom: this.previewElement,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRenderCommnetPreview', context)
      .then(() => interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown);
      })
      .then(() => interceptorManager.process('postPreProcess', context))
      .then(() => {
        var parsedHTML = crowiRenderer.process(context.markdown);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => interceptorManager.process('prePostProcess', context))
      .then(() => {
        context.parsedHTML = crowiRenderer.postProcess(context.parsedHTML, context.dom);
      })
      .then(() => interceptorManager.process('postPostProcess', context))
      .then(() => interceptorManager.process('preRenderCommentPreviewHtml', context))
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postRenderCommentPreviewHtml', context));
  }

  generateInnerHtml(html) {
    return {__html: html};
  }


  render() {
    const crowi = this.props.crowi;
    const username = crowi.me;
    const user = crowi.findUser(username);
    const creatorsPage = `/user/${username}`;
    const comment = this.state.comment;
    const commentPreview = this.state.isMarkdown ? this.getCommentHtml(): ReactUtils.nl2br(comment);

    return (
      <div>
        <form className="form page-comment-form" id="page-comment-form" onSubmit={this.postComment}>
          { username &&
            <div className="comment-form">
              <div className="comment-form-user">
                <a href={creatorsPage}>
                  <UserPicture user={user} />
                </a>
              </div>
              <div className="comment-form-main">
                <div className="comment-write">
                  <Tabs activeKey={this.state.key} id="comment-form-tabs" onSelect={this.handleSelect} animation={false}>
                    <Tab eventKey={1} title="Write">
                      <textarea className="comment-form-comment form-control" id="comment-form-comment" name="comment" required placeholder="Write comments here..." value={this.state.comment} onChange={this.updateState} >
                      </textarea>
                    </Tab>
                    { this.state.isMarkdown == true &&
                    <Tab eventKey={2} title="Preview">
                      <div className="comment-form-preview">
                       {commentPreview}
                      </div>
                    </Tab>
                    }
                  </Tabs>
                </div>
                <div className="comment-submit">
                  <div className="pull-left">
                  { this.state.key == 1 &&
                    <label>
                      <input type="checkbox" id="comment-form-is-markdown" name="isMarkdown" checked={this.state.isMarkdown} value="1" onChange={this.updateState} /> Markdown
                    </label>
                  }
                  </div>
                  <div className="pull-right">
                    <Button type="submit" value="Submit" bsStyle="primary" className="fcbtn btn btn-sm btn-primary btn-outline btn-rounded btn-1b">
                        Comment
                    </Button>
                  </div>
                  <div className="clearfix">
                  </div>
                </div>
              </div>
            </div>
          }
        </form>
      </div>
    );
  }
}

CommentForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  onPostComplete: PropTypes.func,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  crowiRenderer:  PropTypes.object.isRequired,
};
