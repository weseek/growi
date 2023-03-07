import i18n from 'i18next';

import { AlertInfo, AlertType } from '~/components/Common/ClosableTextInput';

// Validator for closeable text input
export const inputValidator = (title: string | null): AlertInfo | null => {

  if (title == null || title === '' || title.trim() === '') {
    return {
      type: AlertType.WARNING,
      message: i18n.t('form_validation.title_required'),
    };
  }
  return null;
};
