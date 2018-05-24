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
export default class CommentHtml extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: 'HTML',
    };

    this.setCommentHtml = this.setCommentHtml.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
  }

  setCommentHtml() {
this.renderHtml(this.props.comment);
  }

  renderHtml(markdown) {
    var context = {
      markdown,
      dom: this.revisionBodyElement,
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
  //       this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postPreviewRenderHtml', context));

  }

  render() {
    console.log(`write`)
    this.setCommentHtml()
    return (
      <div>
        html
        </div>

    )
  }
}

CommentHtml.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer:  PropTypes.object.isRequired,
  comment: PropTypes.string.isRequired,
};
