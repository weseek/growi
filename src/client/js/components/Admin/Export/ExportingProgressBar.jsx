import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class ExportingProgressBar extends React.Component {


  render() {
    const { collectionName, currentCount, totalCount } = this.props;

    const percentage = currentCount / totalCount * 100;
    const isActive = currentCount !== totalCount;

    return (
      <>
        <h5>
          {collectionName}
          <div className="pull-right">{currentCount} / {totalCount}</div>
        </h5>
        <div className="progress progress-sm">
          <div
            className={`progress-bar progress-bar-success ${isActive ? 'progress-bar-striped active' : ''}`}
            style={{ width: `${percentage}%` }}
          >
            <span className="sr-only">{percentage.toFixed(0)}% Complete</span>
          </div>
        </div>
      </>
    );
  }

}

ExportingProgressBar.propTypes = {
  collectionName: PropTypes.string.isRequired,
  currentCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default withTranslation()(ExportingProgressBar);
