import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import type { AutosizeInputProps } from 'react-input-autosize';
import { debounce } from 'throttle-debounce';

import type { InputValidationResult } from '~/client/util/use-input-validator';
import { ValidationTarget, useInputValidator } from '~/client/util/use-input-validator';

import { AutosizeSubmittableInput } from '../Common/SubmittableInput';
import type { SubmittableInputProps } from '../Common/SubmittableInput/types';


type Props = Pick<SubmittableInputProps<AutosizeInputProps>, 'value' | 'onSubmit' | 'onCancel'>;

export const BookmarkFolderNameInput = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { value, onSubmit, onCancel } = props;

  const [validationResult, setValidationResult] = useState<InputValidationResult>();


  const inputValidator = useInputValidator(ValidationTarget.FOLDER);

  const changeHandler = useCallback(async(e: ChangeEvent<HTMLInputElement>) => {
    const validationResult = inputValidator(e.target.value);
    setValidationResult(validationResult ?? undefined);
  }, [inputValidator]);
  const changeHandlerDebounced = debounce(300, changeHandler);

  const cancelHandler = useCallback(() => {
    setValidationResult(undefined);
    onCancel?.();
  }, [onCancel]);

  const isInvalid = validationResult != null;

  return (
    <div>
      <AutosizeSubmittableInput
        value={value}
        inputClassName={`form-control ${isInvalid ? 'is-invalid' : ''}`}
        placeholder={t('bookmark_folder.input_placeholder')}
        aria-describedby={isInvalid ? 'bookmark-folder-name-input-feedback' : undefined}
        autoFocus
        onChange={changeHandlerDebounced}
        onSubmit={onSubmit}
        onCancel={cancelHandler}
      />
      { isInvalid && (
        <div id="bookmark-folder-name-input-feedback" className="invalid-feedback d-block my-1">
          {validationResult.message}
        </div>
      ) }
    </div>
  );
};
