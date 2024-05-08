import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import type { ClosableTextInputProps } from '~/components/Common/ClosableTextInput';
import ClosableTextInput from '~/components/Common/ClosableTextInput';


type Props = ClosableTextInputProps;

export const BookmarkFolderNameInput = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex-fill folder-name-input">
      <ClosableTextInput
        placeholder={t('bookmark_folder.input_placeholder')}
        validationTarget={ValidationTarget.FOLDER}
        {...props}
      />
    </div>
  );
};
