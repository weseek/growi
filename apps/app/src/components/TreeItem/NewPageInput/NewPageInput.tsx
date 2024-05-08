import React, {
  type FC, useCallback,
} from 'react';

import nodePath from 'path';

import { pathUtils, pagePathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/use-input-validator';
import { toastWarning, toastError, toastSuccess } from '~/client/util/toastr';
import ClosableTextInput from '~/components/Common/ClosableTextInput';
import type { IPageForItem } from '~/interfaces/page';

import { NotDraggableForClosableTextInput } from '../NotDraggableForClosableTextInput';

type Props = {
  page: IPageForItem,
  isEnableActions: boolean,
  onSubmit?: (newPagePath: string) => Promise<void>,
  onSubmittionFailed?: () => void,
  onCanceled?: () => void,
};

export const NewPageInput: FC<Props> = (props) => {
  const { t } = useTranslation();

  const {
    page, isEnableActions,
    onSubmit, onSubmittionFailed,
    onCanceled,
  } = props;

  const cancel = useCallback(() => {
    onCanceled?.();
  }, [onCanceled]);

  const create = useCallback(async(inputText) => {
    if (inputText.trim() === '') {
      return cancel();
    }

    const parentPath = pathUtils.addTrailingSlash(page.path as string);
    const newPagePath = nodePath.resolve(parentPath, inputText);
    const isCreatable = pagePathUtils.isCreatablePage(newPagePath);

    if (!isCreatable) {
      toastWarning(t('you_can_not_create_page_with_this_name'));
      return;
    }

    try {
      await onSubmit?.(newPagePath);
      toastSuccess(t('successfully_saved_the_page'));
    }
    catch (err) {
      toastError(err);
    }
    finally {
      onSubmittionFailed?.();
    }
  }, [cancel, onSubmit, onSubmittionFailed, page.path, t]);

  return (
    <>
      {isEnableActions && (
        <NotDraggableForClosableTextInput>
          <ClosableTextInput
            placeholder={t('Input page name')}
            onPressEnter={create}
            onPressEscape={cancel}
            onBlur={create}
            validationTarget={ValidationTarget.PAGE}
          />
        </NotDraggableForClosableTextInput>
      )}
    </>
  );
};
