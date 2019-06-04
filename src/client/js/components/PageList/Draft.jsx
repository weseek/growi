import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Panel from 'react-bootstrap/es/Panel';
import Tooltip from 'react-bootstrap/es/Tooltip';
import OverlayTrigger from 'react-bootstrap/es/OverlayTrigger';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RevisionBody from '../Page/RevisionBody';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isRendered: false,
      isPanelExpanded: false,
      copyButtonLabel: this.props.t('Copy'),
    };

    this.growiRenderer = this.props.appContainer.getRenderer('draft');

    this.changeToolTipLabel = this.changeToolTipLabel.bind(this);
    this.expandPanelHandler = this.expandPanelHandler.bind(this);
    this.collapsePanelHandler = this.collapsePanelHandler.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.renderAccordionTitle = this.renderAccordionTitle.bind(this);
  }

  changeToolTipLabel() {
    // store original label
    const originLabel = this.state.copyButtonLabel;

    this.setState({ copyButtonLabel: 'copied!' });
    setTimeout(() => {
      this.setState({ copyButtonLabel: originLabel });
    }, 1000);
  }

  expandPanelHandler() {
    this.setState({ isPanelExpanded: true });

    if (!this.state.isRendered) {
      this.renderHtml();
    }
  }

  collapsePanelHandler() {
    this.setState({ isPanelExpanded: false });
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
        this.setState({ html: context.parsedHTML, isRendered: true });
      });
  }

  renderAccordionTitle(isExist) {
    const iconClass = this.state.isPanelExpanded ? 'caret-opened' : '';

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
        <span className="mx-2">{this.props.path}</span>
        <span className="label-draft label label-default">draft</span>
      </Fragment>
    );
  }

  render() {
    const { t } = this.props;

    const tooltip = (
      <Tooltip id="draft-copied-tooltip">
        <strong>{this.state.copyButtonLabel}</strong>
      </Tooltip>
    );

    return (
      <div className="draft-list-item">
        <Panel>
          <Panel.Heading className="d-flex">
            <Panel.Toggle>
              {this.renderAccordionTitle(this.props.isExist)}
            </Panel.Toggle>
            <a href={this.props.path}><i className="icon icon-login"></i></a>
            <div className="flex-grow-1"></div>
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
                    title={this.props.t('Edit')}
                  >
                    <i className="mx-2 icon-note" />
                  </a>
                )
              }
              <OverlayTrigger overlay={tooltip} placement="top">
                <CopyToClipboard text={this.props.markdown} onCopy={this.changeToolTipLabel}>
                  <a
                    className="text-center draft-copy"
                  >
                    <i className="mx-2 ti-clipboard" />
                  </a>
                </CopyToClipboard>
              </OverlayTrigger>
              <a
                className="text-danger text-center"
                data-toggle="tooltip"
                data-placement="top"
                title={t('Delete')}
                onClick={() => { return this.props.clearDraft(this.props.path) }}
              >
                <i className="mx-2 icon-trash" />
              </a>
            </div>
          </Panel.Heading>
          <Panel.Collapse onEnter={this.expandPanelHandler} onExit={this.collapsePanelHandler}>
            <Panel.Body>
              {/* loading spinner */}
              { this.state.isPanelExpanded && !this.state.isRendered && (
                <div className="text-center">
                  <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
                </div>
              ) }
              {/* contents */}
              { this.state.isPanelExpanded && this.state.isRendered && (
                <RevisionBody html={this.state.html} />
              ) }
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
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
