import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminSocketIoContainer from '../../../services/AdminSocketIoContainer';

import LabeledProgressBar from '../Common/LabeledProgressBar';

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
    const socket = this.props.adminSocketIoContainer.getSocket();

    socket.on('addPageProgress', (data) => {
      this.setState({
        total: data.totalCount,
        current: data.count,
        skip: data.skipped,
      });
    });

    socket.on('finishAddPage', (data) => {
      this.setState({
        total: data.totalCount,
        current: data.count,
        skip: data.skipped,
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

    function getCompletedLabel() {
      const completedLabel = skip === 0 ? 'Completed' : `Done (${skip} skips)`;
      return completedLabel;
    }

    function getSkipLabel() {
      return `Processing.. (${skip} skips)`;
    }

    const header = isRebuildingCompleted ? getCompletedLabel() : getSkipLabel();

    return (
      <LabeledProgressBar
        header={header}
        currentCount={current}
        errorsCount={skip}
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
          className="btn btn-primary"
          onClick={() => { this.props.onRebuildingRequested() }}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.rebuild_button') }
        </button>

        <p className="form-text text-muted">
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
const RebuildIndexControlsWrapper = withUnstatedContainers(RebuildIndexControls, [AppContainer, AdminSocketIoContainer]);

RebuildIndexControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSocketIoContainer: PropTypes.instanceOf(AdminSocketIoContainer).isRequired,

  isRebuildingProcessing: PropTypes.bool.isRequired,
  isRebuildingCompleted: PropTypes.bool.isRequired,

  isNormalized: PropTypes.bool,
  onRebuildingRequested: PropTypes.func.isRequired,
};

export default withTranslation()(RebuildIndexControlsWrapper);
