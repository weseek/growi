import * as toastr from 'toastr';

const logger = require('@alias/logger')('growi');

export const apiErrorHandler = (err) => {
  logger.error(err);

  toastr.error(err, 'Error', {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  });
};

export const apiSuccessHandler = ({ header, body }) => {
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
