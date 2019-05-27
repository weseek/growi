import * as toastr from 'toastr';

const logger = require('@alias/logger')('growi');

const apiErrorHandler = (err) => {
  logger.error(err);

  toastr.error(err, 'Error occured', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

export default apiErrorHandler;
