import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';

import ProgressBar from '../Common/ProgressBar';

class RebuildIndexControls extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      total: 0,
      current: 0,
      skip: 0,
    };
  }

  componentDidMount() {
    this.initWebSockets();
  }

  initWebSockets() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.on('admin:addPageProgress', (data) => {
      this.setState({
        ...data,
      });
    });

    socket.on('admin:finishAddPage', (data) => {
      this.setState({
        ...data,
      });
    });

  }

  renderProgressBar() {
    const {
      isRebuildingProcessing, isRebuildingCompleted,
    } = this.props;
    const {
      total, current, skip,
    } = this.state;
    const showProgressBar = isRebuildingProcessing || isRebuildingCompleted;

    if (!showProgressBar) {
      return null;
    }

    const header = isRebuildingCompleted ? 'Completed' : `Processing.. (${skip} skips)`;

    return (
      <ProgressBar
        header={header}
        currentCount={current}
        totalCount={total}
      />
    );
  }

  render() {
    const { t, isNormalized, isRebuildingProcessing } = this.props;

    const isEnabled = isNormalized && !isRebuildingProcessing;

    return (
      <>
        { this.renderProgressBar() }

        <button
          type="submit"
          className="btn btn-inverse"
          onClick={() => { this.props.onRebuildingRequested() }}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.rebuild_button') }
        </button>

        <p className="help-block">
          { t('full_text_search_management.rebuild_description_1') }<br />
          { t('full_text_search_management.rebuild_description_2') }<br />
        </p>
      </>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const RebuildIndexControlsWrapper = (props) => {
  return createSubscribedElement(RebuildIndexControls, props, [AppContainer, WebsocketContainer]);
};

RebuildIndexControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,

  isRebuildingProcessing: PropTypes.bool.isRequired,
  isRebuildingCompleted: PropTypes.bool.isRequired,

  isNormalized: PropTypes.bool,
  onRebuildingRequested: PropTypes.func.isRequired,
};

export default withTranslation()(RebuildIndexControlsWrapper);
