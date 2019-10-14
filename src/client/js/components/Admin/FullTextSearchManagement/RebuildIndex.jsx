import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../../UnstatedUtils';
import WebsocketContainer from '../../../services/WebsocketContainer';

class RebuildIndex extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isCompleted: false,
      total: 0,
      current: 0,
      skip: 0,
    };
  }

  componentDidMount() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.on('admin:addPageProgress', (data) => {
      const newStates = Object.assign(data, { isCompleted: false });
      this.setState(newStates);
    });

    socket.on('admin:finishAddPage', (data) => {
      const newStates = Object.assign(data, { isCompleted: true });
      this.setState(newStates);
    });
  }

  render() {
    const {
      total, current, skip, isCompleted,
    } = this.state;
    if (total === 0) {
      return null;
    }

    const progressBarLabel = isCompleted ? 'Completed' : `Processing.. ${current}/${total} (${skip} skips)`;
    const progressBarWidth = isCompleted ? '100%' : `${(current / total) * 100}%`;
    const progressBarClassNames = isCompleted
      ? 'progress-bar progress-bar-success'
      : 'progress-bar progress-bar-striped progress-bar-animated active';

    return (
      <div>
        <h5>
          {progressBarLabel}
          <span className="pull-right">{progressBarWidth}</span>
        </h5>
        <div className="progress progress-sm">
          <div
            className={progressBarClassNames}
            role="progressbar"
            aria-valuemin="0"
            aria-valuenow={current}
            aria-valuemax={total}
            style={{ width: progressBarWidth }}
          >
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RebuildIndexWrapper = (props) => {
  return createSubscribedElement(RebuildIndex, props, [WebsocketContainer]);
};

RebuildIndex.propTypes = {
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

export default RebuildIndexWrapper;
