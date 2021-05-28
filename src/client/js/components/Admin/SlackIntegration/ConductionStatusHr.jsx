import React from 'react';
import PropTypes from 'prop-types';


const ConductionStatusHr = (props) => {
  const { conductionStatus } = props;


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
  conductionStatus: PropTypes.string.isRequired,
};

export default ConductionStatusHr;
