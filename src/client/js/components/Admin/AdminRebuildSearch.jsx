import React from 'react';
import PropTypes from 'prop-types';

export default class AdminRebuildSearch extends React.Component {
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
    const socket = this.props.crowi.getWebSocket();

    socket.on('admin:addPageProgress', data => {
      const newStates = Object.assign(data, { isCompleted: false });
      this.setState(newStates);
    });

    socket.on('admin:finishAddPage', data => {
      const newStates = Object.assign(data, { isCompleted: true });
      this.setState(newStates);
    });
  }

  render() {
    const { total, current, skip, isCompleted } = this.state;
    if (total === 0) {
      return null;
    }

    if (isCompleted) {
      return (
        <div className="progress">
          <div className="progress-bar progress-bar-striped" style={{ width: '100%' }} />
        </div>
      );
    }

    return (
      <div className="progress">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated active"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={current}
          aria-valuemax={total}
          style={{ width: `${(current / total) * 100}%` }}
        >
          {current}/{total} ({skip} skips)
        </div>
      </div>
    );
  }
}

AdminRebuildSearch.propTypes = {
  crowi: PropTypes.object.isRequired,
};
