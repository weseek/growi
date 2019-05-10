import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import { withTranslation } from 'react-i18next';

import GrowiRenderer from '../../util/GrowiRenderer';

import RevisionBody from '../Page/RevisionBody';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, { mode: 'draft' });

    this.renderHtml = this.renderHtml.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderPopover = this.renderPopover.bind(this);
    this.copyMarkdownToClipboard = this.copyMarkdownToClipboard.bind(this);
  }

  async componentDidMount() {
    this.setState({ html: await this.renderHtml(this.props.markdown) });
  }

  renderButton(isExist, markdown) {
    if (isExist) {
      return (
        <a
          className="draft-copy"
          data-toggle="tooltip"
          data-placement="bottom"
          title={this.props.t('Copy')}
          onClick={this.copyMarkdownToClipboard}
        >
          <i className="icon-doc" />
        </a>
      );
    }

    return (
      <Fragment>
        <span className="label-draft label label-default">draft</span>
        <a
          href={`${this.props.path}#edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="draft-delete"
          data-toggle="tooltip"
          data-placement="bottom"
          title={this.props.t('Edit')}
          onClick={() => { return this.props.clearDraft(this.props.path) }}
        >
          <i className="icon-note" />
        </a>
      </Fragment>
    );
  }

  copyMarkdownToClipboard() {
    navigator.clipboard.writeText(this.props.markdown);
  }

  renderPopover(id, markdown) {
    return (
      <Popover id={id}>
        <RevisionBody html={this.state.html} />
      </Popover>
    );
  }

  async renderHtml(markdown) {
    const context = {
      markdown,
    };

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    const html = await interceptorManager.process('prePreProcess', context)
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
      .then(() => { return context.parsedHTML });

    return html;
  }

  render() {
    const { t } = this.props;

    return (
      <li className="d-flex align-items-center">
        <OverlayTrigger placement="bottom" overlay={this.renderPopover(this.props.path, this.props.markdown)}>
          <span
            data-toggle="tooltip"
            data-placement="bottom"
            title={t('Click to copy')}
            onClick={this.copyMarkdownToClipboard}
          >
            <i className="icon-doc"></i>
            {this.props.path} {this.props.isExist ? `(${t('page exists')})` : ''}
          </span>
        </OverlayTrigger>
        {this.renderButton(this.props.isExist, this.props.markdown)}
        <a
          className="text-danger draft-delete"
          data-toggle="tooltip"
          data-placement="top"
          title={t('Delete')}
          onClick={() => { return this.props.clearDraft(this.props.path) }}
        >
          <i className="icon-trash" />
        </a>
      </li>
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
