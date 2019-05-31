import * as toastr from 'toastr';

const logger = require('@alias/logger')('growi');

const errorFormatter = {};

errorFormatter.logger = (err) => {
  return err.toString().replace(/\n/g, ', ');
};

errorFormatter.toastr = (err) => {
  const prefixRegexp = /^Error: /;
  let message = err.toString().replace(/\n/g, '<br>');

  if (prefixRegexp.test(message)) {
    message = message.replace(prefixRegexp, '');
  }

  return message;
};

export const apiErrorHandler = (err, header = 'Error') => {
  logger.error(errorFormatter.logger(err));

  toastr.error(errorFormatter.toastr(err), header, {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
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
