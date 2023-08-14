import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import ClosableTextInput from '~/components/Common/ClosableTextInput';


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

  return (
    <div className="flex-fill folder-name-input">
      <ClosableTextInput
        value={value}
        placeholder={t('bookmark_folder.input_placeholder')}
        onClickOutside={onClickOutside}
        onPressEnter={onPressEnter}
        validationTarget={ValidationTarget.FOLDER}
      />
    </div>
  );
};
