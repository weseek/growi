import React from 'react';
import PropTypes from 'prop-types';


const ConductionStatusHr = (props) => {
  const { errorCount } = props;

  console.log(errorCount);
  return (
    <>
      {errorCount === 0 && <hr className="align-self-center border-success admin-border-success"></hr>}
      {errorCount !== 0 && <hr className="align-self-center border-danger admin-border-danger"></hr>}
      {errorCount >= 1 && <hr className="align-self-center border-warning admin-border-danger"></hr>}
    </>
  );
};

ConductionStatusHr.propTypes = {
  errorCount: PropTypes.number.isRequired,
};

export default ConductionStatusHr;
