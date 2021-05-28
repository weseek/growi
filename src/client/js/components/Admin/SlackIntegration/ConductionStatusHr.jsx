import React from 'react';
import PropTypes from 'prop-types';


const ConductionStatusHr = (props) => {
  const { workspaceNames } = props;

  let errorCount = 0;
  workspaceNames.forEach((w) => {
    if (w == null) {
      errorCount++;
    }
  });

  let conductionStatus;
  if (errorCount === 0 && workspaceNames.length !== 0) {
    conductionStatus = 'green';
  }
  else if (errorCount === workspaceNames.length) {
    conductionStatus = 'red';
  }
  else {
    conductionStatus = 'yellow';
  }
  return (
    <>
      {conductionStatus === 'green' && (
      <hr className="align-self-center border-success admin-border-success"></hr>
      )}
      {conductionStatus === 'red' && (
      <hr className="align-self-center border-danger admin-border-danger"></hr>
      )}
      {conductionStatus === 'yellow' && (
      <hr className="align-self-center border-warning admin-border-danger"></hr>
      )}
    </>
  );
};

ConductionStatusHr.propTypes = {
  workspaceNames: PropTypes.array.isRequired,
};

export default ConductionStatusHr;
