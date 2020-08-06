import React from 'react';
import PropTypes from 'prop-types';

import ApiErrorMessage from './ApiErrorMessage';
import toArrayIfNot from '../../../../lib/util/toArrayIfNot';

function ApiErrorMessageWrapper(props) {
  const errs = toArrayIfNot(props.errs);

  return (
    <>
      {errs.map(err => <ApiErrorMessage key={err.code} errorCode={err.code} errorMessage={err.message} targetPath={props.targetPath} />)}
    </>
  );

}

ApiErrorMessageWrapper.propTypes = {
  errs:         PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  targetPath:   PropTypes.string,
};

export default ApiErrorMessageWrapper;
