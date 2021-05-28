import React from 'react';
import PropTypes from 'prop-types';


const ConductionStatusHr = (props) => {
  const { errorCount, totalCount } = props;

  return (
    <>
      {errorCount === 0 && totalCount !== 0 && <hr className="align-self-center border-success admin-border-success"></hr>}
      {errorCount === totalCount && <hr className="align-self-center border-danger admin-border-danger"></hr>}
      {errorCount >= 1 && errorCount < totalCount && <hr className="align-self-center border-warning admin-border-danger"></hr>}
    </>
  );
};

ConductionStatusHr.propTypes = {
  errorCount: PropTypes.number.isRequired,
  totalCount: PropTypes.array.isRequired,
};

export default ConductionStatusHr;
