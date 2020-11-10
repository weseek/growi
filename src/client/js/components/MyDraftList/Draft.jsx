import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  Collapse,
  UncontrolledTooltip,
} from 'reactstrap';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import RevisionBody from '../Page/RevisionBody';

class Draft extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      isRendered: false,
      isPanelExpanded: false,
      showCopiedMessage: false,
    };

    this.growiRenderer = this.props.appContainer.getRenderer('draft');

    this.changeToolTipLabel = this.changeToolTipLabel.bind(this);
    this.expandPanelHandler = this.expandPanelHandler.bind(this);
    this.collapsePanelHandler = this.collapsePanelHandler.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.renderAccordionTitle = this.renderAccordionTitle.bind(this);
  }

  changeToolTipLabel() {
    this.setState({ showCopiedMessage: true });
    setTimeout(() => {
      this.setState({ showCopiedMessage: false });
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
    const { isPanelExpanded } = this.state;

    const iconClass = isPanelExpanded ? 'caret-opened' : '';

    return (
      <span>
        <i className={`caret ${iconClass}`}></i>
        <span className="mx-2" onClick={() => this.setState({ isPanelExpanded: !isPanelExpanded })}>
          {this.props.path}
        </span>
        { isExist && (
          <span>({this.props.t('page exists')})</span>
        ) }
        { !isExist && (
          <span className="badge badge-secondary">draft</span>
        ) }

        <a className="ml-2" href={this.props.path}><i className="icon icon-login"></i></a>
      </span>
    );
  }

  renderControls() {
    const { t, path, index } = this.props;

    const tooltipTargetId = `draft-copied-tooltip_${index}`;

    return (
      <div className="icon-container">
        {this.props.isExist
          ? null
          : (
            <a
              href={`${path}#edit`}
              target="_blank"
              rel="noopener noreferrer"
              data-toggle="tooltip"
              title={this.props.t('Edit')}
            >
              <i className="mx-2 icon-note" />
            </a>
          )
        }
        <span id={tooltipTargetId}>
          <CopyToClipboard text={this.props.markdown} onCopy={this.changeToolTipLabel}>
            <a
              className="text-center draft-copy"
            >
              <i className="mx-2 ti-clipboard" />
            </a>
          </CopyToClipboard>
        </span>
        <UncontrolledTooltip placement="top" target={tooltipTargetId} fade={false} trigger="hover">
          { this.state.showCopiedMessage && (
            <strong>copied!</strong>
          ) }
          { !this.state.showCopiedMessage && (
            <span>{this.props.t('Copy')}</span>
          ) }
        </UncontrolledTooltip>
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
    );
  }

  render() {
    const { isPanelExpanded } = this.state;

    return (
      <div className="accordion draft-list-item" role="tablist">
        <div className="card">

          <div className="card-header d-flex" role="tab">
            {this.renderAccordionTitle(this.props.isExist)}

            <div className="flex-grow-1"></div>

            {this.renderControls()}
          </div>

          <Collapse isOpen={isPanelExpanded} onEntering={this.expandPanelHandler} onExiting={this.collapsePanelHandler}>
            <div className="card-body">
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
            </div>
          </Collapse>

        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const DraftWrapper = withUnstatedContainers(Draft, [AppContainer]);


Draft.propTypes = {
  t: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  index: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  isExist: PropTypes.bool.isRequired,
  clearDraft: PropTypes.func.isRequired,
};

export default withTranslation()(DraftWrapper);
