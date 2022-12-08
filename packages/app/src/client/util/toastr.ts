import { toast, ToastContent, ToastOptions } from 'react-toastify';
import * as toastrLegacy from 'toastr';

import { toArrayIfNot } from '~/utils/array-utils';


export const toastErrorOption: ToastOptions = {
  autoClose: 0,
  closeButton: true,
};
export const toastError = (err: string | Error | Error[], option: ToastOptions = toastErrorOption): void => {
  const errs = toArrayIfNot(err);

  if (errs.length === 0) {
    return;
  }

  for (const err of errs) {
    const message = (typeof err === 'string') ? err : err.message;
    toast.error(message || err, option);
  }
};

export const toastSuccessOption: ToastOptions = {
  autoClose: 2000,
  closeButton: true,
};
export const toastSuccess = (content: ToastContent, option: ToastOptions = toastSuccessOption): void => {
  toast.success(content, option);
};

export const toastWarningOption: ToastOptions = {
  autoClose: 5000,
  closeButton: true,
};
export const toastWarning = (content: ToastContent, option: ToastOptions = toastWarningOption): void => {
  toastrLegacy.warning(content, option);
};


const toastrLegacyOption = {
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

export const legacy = {
  // accepts both a single error and an array of errors
  toastError: (err: string | Error | Error[], header = 'Error', option = toastrLegacyOption.error): void => {
    const errs = toArrayIfNot(err);

    if (errs.length === 0) {
      toastrLegacy.error('', header);
    }

    for (const err of errs) {
      const message = (typeof err === 'string') ? err : err.message;
      toastrLegacy.error(message || err, header, option);
    }
  },

  // only accepts a single item
  toastSuccess: (body: string, header = 'Success', option = toastrLegacyOption.success): void => {
    toastrLegacy.success(body, header, option);
  },

  toastWarning: (body: string, header = 'Warning', option = toastrLegacyOption.warning): void => {
    toastrLegacy.warning(body, header, option);
  },
};
