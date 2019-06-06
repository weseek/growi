import * as toastr from 'toastr';
import toArrayIfNot from '../../../lib/util/toArrayIfNot';

const toastrOption = {
  error: {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  },
  success: {
    closeButton: true,
    progressBar: true,
    newestOnTop: false,
    showDuration: '100',
    hideDuration: '100',
    timeOut: '3000',
  },
};

export const toastError = (err, header = 'Error', option = toastrOption.error) => {
  const errs = toArrayIfNot(err);

  for (const err of errs) {
    toastr.error(err.message, header, option);
  }
};

export const toastSuccess = (body, header = 'Success', option = toastrOption.success) => {
  toastr.success(body, header, option);
};
