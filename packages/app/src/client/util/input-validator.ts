export const AlertType = {
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];

export const ValidationTarget = {
  FOLDER: 'folder_name',
  PAGE: 'page_name',
  DEFAULT: 'field',
};

export type ValidationTarget = typeof ValidationTarget[keyof typeof ValidationTarget];

export type AlertInfo = {
  type?: AlertType
  message?: string,
  target?: string
}

export const inputValidator = async(title: string | null, target?: string): Promise<AlertInfo | null> => {
  const validationTarget = target || ValidationTarget.DEFAULT;
  if (title == null || title === '' || title.trim() === '') {
    return {
      type: AlertType.WARNING,
      message: 'form_validation.field_required',
      target: validationTarget,
    };
  }
  return null;
};
