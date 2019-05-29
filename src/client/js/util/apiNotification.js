import * as toastr from 'toastr';

const logger = require('@alias/logger')('growi');

export const apiErrorHandler = (err, header = 'Error') => {
  logger.error(err);

  toastr.error(err, header, {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

export const apiSuccessHandler = (body, header = '') => {
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
