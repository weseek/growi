import React from 'react';
import PropTypes from 'prop-types';

import * as toastr from 'toastr';

import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';

export default class PageEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      revisionId: this.props.revisionId,
      markdown: this.props.markdown,
    };
    // initial preview
    this.renderPreview();

    this.setCaretLine = this.setCaretLine.bind(this);
    this.focusToEditor = this.focusToEditor.bind(this);
    this.onMarkdownChanged = this.onMarkdownChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onEditorScroll = this.onEditorScroll.bind(this);
    this.getMaxScrollTop = this.getMaxScrollTop.bind(this);
    this.getScrollTop = this.getScrollTop.bind(this);
  }

  focusToEditor() {
    this.refs.editor.forceToFocus();
  }

  /**
   * set caret position of editor
   * @param {number} line
   */
  setCaretLine(line) {
    this.refs.editor.setCaretLine(line);
  }

  /**
   * the change event handler for `markdown` state
   * @param {string} value
   */
  onMarkdownChanged(value) {
    this.setState({
      markdown: value,
      html: '',
    });

    this.renderPreview();
  }

  /**
   * the save event handler
   */
  onSave() {
    let endpoint;
    let data;

    // update
    if (this.props.pageId != null) {
      endpoint = '/pages.update';
      data = {
        page_id: this.props.pageId,
        revision_id: this.state.revisionId,
        body: this.state.markdown,
      };
    }
    // create
    else {
      endpoint = '/pages.create';
      data = {
        path: this.props.pagePath,
        body: this.state.markdown,
      };
    }

    this.props.crowi.apiPost(endpoint, data)
      .then((res) => {
        const page = res.page;

        toastr.success(undefined, 'Saved successfully', {
          closeButton: true,
          progressBar: true,
          newestOnTop: false,
          showDuration: "100",
          hideDuration: "100",
          timeOut: "1200",
          extendedTimeOut: "150",
        });

        // update states
        this.setState({
          revisionId: page.revision._id,
          markdown: page.revision.body
        })
      })
      .catch((error) => {
        console.error(error);
        toastr.error(error.message, 'Error occured on saveing', {
          closeButton: true,
          progressBar: true,
          newestOnTop: false,
          showDuration: "100",
          hideDuration: "100",
          timeOut: "3000",
        });
      });
  }

  /**
   * the scroll event handler from codemirror
   * @param {any} data {left, top, width, height, clientWidth, clientHeight} object that represents the current scroll position, the size of the scrollable area, and the size of the visible area (minus scrollbars).
   *    see https://codemirror.net/doc/manual.html#events
   */
  onEditorScroll(data) {
    const rate = data.top / (data.height - data.clientHeight)
    const top = this.getScrollTop(this.previewElement, rate);

    this.previewElement.scrollTop = top;
  }
  /**
   * transplanted from crowi-form.js -- 2018.01.21 Yuki Takei
   * @param {*} dom
   */
  getMaxScrollTop(dom) {
    var rect = dom.getBoundingClientRect();
    return dom.scrollHeight - rect.height;
  };
  /**
   * transplanted from crowi-form.js -- 2018.01.21 Yuki Takei
   * @param {*} dom
   */
  getScrollTop(dom, rate) {
    var maxScrollTop = this.getMaxScrollTop(dom);
    var top = maxScrollTop * rate;
    return top;
  };

  renderPreview() {
    const config = this.props.crowi.config;

    // generate options obj
    const rendererOptions = {
      // see: https://www.npmjs.com/package/marked
      marked: {
        breaks: config.isEnabledLineBreaks,
      }
    };

    // render html
    var context = {
      markdown: this.state.markdown,
      dom: this.previewElement,
      currentPagePath: decodeURIComponent(location.pathname)
    };

    this.props.crowi.interceptorManager.process('preRenderPreview', context)
      .then(() => crowi.interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown, context.dom);
      })
      .then(() => crowi.interceptorManager.process('postPreProcess', context))
      .then(() => {
        var parsedHTML = crowiRenderer.render(context.markdown, context.dom, rendererOptions);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => crowi.interceptorManager.process('postRenderPreview', context))
      .then(() => crowi.interceptorManager.process('preRenderPreviewHtml', context))
      .then(() => {
        this.setState({html: context.parsedHTML});

        // set html to the hidden input (for submitting to save)
        $('#form-body').val(this.state.markdown);
      })
      // process interceptors for post rendering
      .then(() => crowi.interceptorManager.process('postRenderPreviewHtml', context));

  }

  render() {
    return (
      <div className="row">
        <div className="col-md-6 col-sm-12 page-editor-editor-container">
          <Editor ref="editor" value={this.state.markdown}
              onScroll={this.onEditorScroll}
              onChange={this.onMarkdownChanged}
              onSave={this.onSave}
          />
        </div>
        <div className="col-md-6 hidden-sm hidden-xs page-editor-preview-container">
          <Preview html={this.state.html} inputRef={el => this.previewElement = el} />
        </div>
      </div>
    )
  }
}

PageEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  pagePath: PropTypes.string,
  markdown: PropTypes.string,
};
