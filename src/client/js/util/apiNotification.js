import * as toastr from 'toastr';
import toArrayIfNot from '../../../lib/util/toArrayIfNot';

const logger = require('@alias/logger')('growi');

const errorFormatter = (err) => {
  const prefixRegexp = /^Error: /;
  let message = err.toString();

  if (prefixRegexp.test(message)) {
    message = message.replace(prefixRegexp, '');
  }

  return message;
};

export const apiErrorHandler = (err, header = 'Error') => {
  const errs = toArrayIfNot(err);

  for (const err of errs) {
    logger.error(err);

    toastr.error(errorFormatter(err), header, {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }
};

export const apiSuccessHandler = (body, header = 'Success') => {
  toastr.success(body, header, {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

export default apiErrorHandler;
