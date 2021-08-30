// show API error/sucess toastr

import * as toastr from 'toastr';
import { toArrayIfNot } from '~/utils/array-utils';

const toastrOption = {
  error: {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '0',
  },
  success: {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  },
  warning: {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '6000',
  },
};

// accepts both a single error and an array of errors
export const toastError = (err, header = 'Error', option = toastrOption.error) => {
  const errs = toArrayIfNot(err);

  if (err.length === 0) {
    toastr.error('', header);
  }

  for (const err of errs) {
    toastr.error(err.message || err, header, option);
  }
};

// only accepts a single item
export const toastSuccess = (body, header = 'Success', option = toastrOption.success) => {
  toastr.success(body, header, option);
};

export const toastWarning = (body, header = 'Warning', option = toastrOption.warning) => {
  toastr.warning(body, header, option);
};
