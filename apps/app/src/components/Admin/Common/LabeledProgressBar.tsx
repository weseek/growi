import React from 'react';

import { Progress } from 'reactstrap';

type Props = {
  header: string,
  currentCount: number,
  totalCount: number,
  errorsCount?: number,
  isInProgress?: boolean,
}

const LabeledProgressBar = (props: Props): JSX.Element => {
  const {
    header, currentCount, totalCount, errorsCount, isInProgress,
  } = props;

  const progressingColor = isInProgress ? 'info' : 'success';

  return (
    <>
      <h6 className="my-1">
        {header}
        <div className="float-end">{currentCount} / {totalCount}</div>
      </h6>
      <Progress multi>
        <Progress bar max={totalCount} color={progressingColor} striped={isInProgress} animated={isInProgress} value={currentCount} />
        <Progress bar max={totalCount} color="danger" striped={isInProgress} animated={isInProgress} value={errorsCount} />
      </Progress>
    </>
  );

};

export default LabeledProgressBar;
