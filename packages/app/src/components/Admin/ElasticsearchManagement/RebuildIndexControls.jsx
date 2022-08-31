import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import { useAdminSocket } from '~/stores/socket-io';

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
    const { socket } = this.props;

    if (socket != null) {
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

const RebuildIndexControlsFC = (props) => {
  const { t } = useTranslation('admin');
  const { data: socket } = useAdminSocket();
  return <RebuildIndexControls t={t} socket={socket} {...props} />;
};


RebuildIndexControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isRebuildingProcessing: PropTypes.bool.isRequired,
  isRebuildingCompleted: PropTypes.bool.isRequired,

  isNormalized: PropTypes.bool,
  onRebuildingRequested: PropTypes.func.isRequired,
  socket: PropTypes.object,
};

export default RebuildIndexControlsFC;
