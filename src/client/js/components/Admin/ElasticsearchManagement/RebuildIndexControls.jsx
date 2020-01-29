import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastError } from '../../../util/apiNotification';

import ProgressBar from '../Common/ProgressBar';

class RebuildIndexControls extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
      isCompleted: false,

      total: 0,
      current: 0,
      skip: 0,
    };

    this.rebuildIndices = this.rebuildIndices.bind(this);
  }

  componentDidMount() {
    this.initWebSockets();
  }

  initWebSockets() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.on('admin:addPageProgress', (data) => {
      this.setState({
        isProcessing: true,
        ...data,
      });
    });

    socket.on('admin:finishAddPage', (data) => {
      this.setState({
        isProcessing: false,
        isCompleted: true,
        ...data,
      });
    });

    socket.on('admin:rebuildingFailed', (data) => {
      toastError(new Error(data.error), 'Rebuilding Index has failed.');
    });
  }

  async rebuildIndices() {
    this.setState({ isProcessing: true });
    this.props.onRebuildingRequested();
  }

  renderProgressBar() {
    const {
      total, current, skip, isProcessing, isCompleted,
    } = this.state;
    const showProgressBar = isProcessing || isCompleted;

    if (!showProgressBar) {
      return null;
    }

    const header = isCompleted ? 'Completed' : `Processing.. (${skip} skips)`;

    return (
      <ProgressBar
        header={header}
        currentCount={current}
        totalCount={total}
      />
    );
  }

  render() {
    const { t, isNormalized } = this.props;

    const isEnabled = isNormalized && !this.state.isProcessing;

    return (
      <>
        { this.renderProgressBar() }

        <button
          type="submit"
          className="btn btn-inverse"
          onClick={this.rebuildIndices}
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

  isNormalized: PropTypes.bool,
  onRebuildingRequested: PropTypes.func.isRequired,
};
RebuildIndexControls.defaultProps = {
  isNormalized: false,
};

export default withTranslation()(RebuildIndexControlsWrapper);
