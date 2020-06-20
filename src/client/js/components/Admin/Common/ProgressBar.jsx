import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class ProgressBar extends React.Component {


  render() {
    const {
      header, currentCount, totalCount, isInProgress,
    } = this.props;

    const percentage = currentCount / totalCount * 100;
    const isActive = (isInProgress != null)
      ? isInProgress //                         apply props.isInProgress if set
      : (currentCount !== totalCount); //       otherwise, set true when currentCount does not equal totalCount

    return (
      <>
        <h6 className="my-1">
          {header}
          <div className="float-right">{currentCount} / {totalCount}</div>
        </h6>
        <div className="progress">
          <div
            className={`progress-bar ${isActive ? 'bg-info progress-bar-striped active' : 'bg-success'}`}
            style={{ width: `${percentage}%` }}
          >
            <span className="sr-only">{percentage.toFixed(0)}% Complete</span>
          </div>
        </div>
      </>
    );
  }

}

ProgressBar.propTypes = {
  header: PropTypes.string.isRequired,
  currentCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  isInProgress: PropTypes.bool,
};

export default withTranslation()(ProgressBar);
