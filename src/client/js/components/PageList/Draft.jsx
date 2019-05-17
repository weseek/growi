import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import GrowiRenderer from '../../util/GrowiRenderer';

import RevisionBody from '../Page/RevisionBody';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isOpen: false,
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, { mode: 'draft' });

    this.renderHtml = this.renderHtml.bind(this);
    this.toggleContent = this.toggleContent.bind(this);
    this.copyMarkdownToClipboard = this.copyMarkdownToClipboard.bind(this);
    this.renderAccordionTitle = this.renderAccordionTitle.bind(this);
  }

  copyMarkdownToClipboard() {
    navigator.clipboard.writeText(this.props.markdown);
  }

  async toggleContent(e) {
    const target = e.currentTarget.getAttribute('data-target');

    if (!this.state.html) {
      await this.renderHtml();
    }

    if (this.state.isOpen) {
      $(target).collapse('hide');
      this.setState({ isOpen: false });
    }
    else {
      $(target).collapse('show');
      this.setState({ isOpen: true });
    }
  }

  async renderHtml() {
    const context = {
      markdown: this.props.markdown,
    };

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    await interceptorManager.process('prePreProcess', context)
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      });
  }

  renderAccordionTitle(isExist) {
    if (isExist) {
      return (
        <Fragment>
          <span>{this.props.path}</span>
          <span className="mx-2">({this.props.t('page exists')})</span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <a href={`${this.props.path}#edit`} target="_blank" rel="noopener noreferrer">{this.props.path}</a>
        <span className="mx-2">
          <span className="label-draft label label-default">draft</span>
        </span>
      </Fragment>
    );
  }

  render() {
    const { t } = this.props;
    const id = this.props.path.replace('/', '-');

    return (
      <div className="timeline-body">
        <div className="panel panel-timeline">
          <div className="panel-heading d-flex justify-content-between">
            <div className="panel-title" onClick={this.toggleContent} data-target={`#${id}`}>
              {this.renderAccordionTitle(this.props.isExist)}
            </div>
            <div>
              {this.props.isExist
                ? null
                : (
                  <a
                    href={`${this.props.path}#edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="draft-edit"
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title={this.props.t('Edit')}
                  >
                    <i className="icon-note" />
                  </a>
                )
              }
              <a
                className="draft-copy"
                data-toggle="tooltip"
                data-placement="bottom"
                title={this.props.t('Copy')}
                onClick={this.copyMarkdownToClipboard}
              >
                <i className="icon-doc" />
              </a>
              <a
                className="text-danger draft-delete"
                data-toggle="tooltip"
                data-placement="top"
                title={t('Delete')}
                onClick={() => { return this.props.clearDraft(this.props.path) }}
              >
                <i className="icon-trash" />
              </a>
            </div>
          </div>
          <div className="panel-body collapse" id={id} aria-labelledby={id} data-parent="#draft-list">
            <div className="revision-body wiki">
              <RevisionBody html={this.state.html} />
            </div>
          </div>
        </div>
      </div>
    );
  }

}

Draft.propTypes = {
  t: PropTypes.func.isRequired,
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  isExist: PropTypes.bool.isRequired,
  clearDraft: PropTypes.func.isRequired,
};

export default withTranslation()(Draft);
