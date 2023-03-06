import { useTranslation } from 'next-i18next';

import ClosableTextInput, { AlertInfo, AlertType } from '~/components/Common/ClosableTextInput';


type Props = {
  onClickOutside: () => void
  onPressEnter: (folderName: string) => void
  value?: string
}

export const BookmarkFolderNameInput = (props: Props): JSX.Element => {
  const {
    onClickOutside, onPressEnter, value,
  } = props;
  const { t } = useTranslation();


  const inputValidator = (title: string | null): AlertInfo | null => {
    if (title == null || title === '' || title.trim() === '') {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.title_required'),
      };
    }
    return null;
  };

  return (
    <div className="flex-fill folder-name-input">
      <ClosableTextInput
        value={ value }
        placeholder={t('bookmark_folder.input_placeholder')}
        onClickOutside={onClickOutside}
        onPressEnter={onPressEnter}
        inputValidator={inputValidator}
      />
    </div>
  );
};
