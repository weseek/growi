import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RevisionBody from '../Page/RevisionBody';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isOpen: false,
    };

    this.growiRenderer = this.props.appContainer.getRenderer('draft');

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
    const interceptorManager = this.props.appContainer.interceptorManager;
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
    const iconClass = this.state.isOpen ? 'caret-opened' : '';

    if (isExist) {
      return (
        <Fragment>
          <i className={`caret ${iconClass}`}></i>
          <span className="mx-2">{this.props.path}</span>
          <span>({this.props.t('page exists')})</span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <i className={`caret ${iconClass}`}></i>
        <a className="mx-2" href={`${this.props.path}#edit`} target="_blank" rel="noopener noreferrer">{this.props.path}</a>
        <span className="label-draft label label-default">draft</span>
      </Fragment>
    );
  }

  render() {
    const { t } = this.props;
    const id = this.props.path.replace('/', '-');

    return (
      <div className="draft-list-item">
        <div className="panel">
          <div className="panel-heading d-flex justify-content-between">
            <div className="panel-title" onClick={this.toggleContent} data-target={`#${id}`}>
              {this.renderAccordionTitle(this.props.isExist)}
            </div>
            <div className="icon-container">
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

/**
 * Wrapper component for using unstated
 */
const DraftWrapper = (props) => {
  return createSubscribedElement(Draft, props, [AppContainer]);
};


Draft.propTypes = {
  t: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  path: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  isExist: PropTypes.bool.isRequired,
  clearDraft: PropTypes.func.isRequired,
};

export default withTranslation()(DraftWrapper);
