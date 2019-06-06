import toArrayIfNot from '../../../lib/util/toArrayIfNot';

const logger = require('@alias/logger')('growi:apiv3');

const apiv3ErrorHandler = (_err, header = 'Error') => {
  // extract api errors from general 400 err
  const err = _err.response ? _err.response.data.errors : _err;
  const errs = toArrayIfNot(err);

  for (const err of errs) {
    logger.error(err.message);
  }

  return errs;
};

export default apiv3ErrorHandler;
