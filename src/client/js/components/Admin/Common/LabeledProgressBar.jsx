import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Progress } from 'reactstrap';

const LabeledProgressBar = (props) => {

  const {
    header, currentCount, totalCount, errorsCount, isInProgress,
  } = props;

  const progressingColor = isInProgress ? 'info' : 'success';

  return (
    <>
      <h6 className="my-1">
        {header}
        <div className="float-right">{currentCount} / {totalCount}</div>
      </h6>
      <Progress multi>
        <Progress bar max={totalCount} color={progressingColor} striped={isInProgress} animated={isInProgress} value={currentCount} />
        <Progress bar max={totalCount} color="danger" striped={isInProgress} animated={isInProgress} value={errorsCount} />
      </Progress>
    </>
  );

};

LabeledProgressBar.propTypes = {
  header: PropTypes.string.isRequired,
  currentCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  errorsCount: PropTypes.number,
  isInProgress: PropTypes.bool,
};

export default withTranslation()(LabeledProgressBar);
