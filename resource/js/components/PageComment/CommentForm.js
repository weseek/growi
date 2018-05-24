import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';
import FormControl from 'react-bootstrap/es/FormControl';
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
      comment: '# a',
      isMarkdown: false,
      html: '',
     };

    this.updateState = this.updateState.bind(this);
    this.postComment = this.postComment.bind(this);
    this.getCommentHtml = this.getCommentHtml.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
  }

  updateState(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
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
          isMarkdown: false,
        });
      });
  }

  getCommentHtml(){
    if(!this.state.html){
      this.renderHtml(this.state.comment)
    }
  }

  renderHtml(markdown) {
    var context = {
      markdown,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('prePreviewRender', context)
      .then(() => interceptorManager.process('prePreviewPreProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown);
      })
      .then(() => interceptorManager.process('postPreviewPreProcess', context))
      .then(() => {
        var parsedHTML = crowiRenderer.process(context.markdown);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => interceptorManager.process('prePreviewPostProcess', context))
      .then(() => {
        context.parsedHTML = crowiRenderer.postProcess(context.parsedHTML, context.dom);
      })
      .then(() => interceptorManager.process('postPreviewPostProcess', context))
      .then(() => interceptorManager.process('prePreviewRenderHtml', context))
      .then(() => {
  　　     this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postPreviewRenderHtml', context));
  }

  generateInnerHtml(html) {
    return {__html: html};
  }


render() {
  this.getCommentHtml()
  console.log(this.state.html)
  //{% if not user %}disabled{% endif %}をtextareaとbuttonに追加
  // denounce/throttle
  return (
    <div>
      <form className="form page-comment-form" id="page-comment-form" onSubmit={this.postComment}>
        <div className="comment-form">
          <div className="comment-form-user">
          </div>
          <div className="comment-form-main">
            <div className="comment-write">
 	        		<Tabs defaultActiveKey={1} id="comment-form-tabs">
                <Tab eventKey={1} title="Write">
                  <textarea className="comment-form-comment form-control" id="comment-form-comment" name="comment" required placeholder="Write comments here..." value={this.state.comment} onChange={this.updateState} >
                  </textarea>
                  <div className="form-check">
                    <input type="checkbox" id="comment-form-is-markdown" name="isMarkdown" checked={this.state.isMarkdown} value="1" onChange={this.updateState} /> Markdown<br />
                  </div>
                </Tab>
                <Tab eventKey={2} title="Prevrew">
                  <div className="comment-form-prevew">
                    <div className="commenthtml" dangerouslySetInnerHTML={this.generateInnerHtml(this.state.html)}>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
            <div className="comment-submit">
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
