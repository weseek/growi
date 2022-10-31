import { useState } from 'react';

import { useTranslation } from 'next-i18next';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import ClosableTextInput, { AlertInfo, AlertType } from '~/components/Common/ClosableTextInput';
import { useSWRxBookamrkFolderAndChild } from '~/stores/bookmark-folder';


type Props = {
  onClickOutside: () => void
}

const BookmarkFolderNameInput = (props: Props): JSX.Element => {
  const { onClickOutside } = props;
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState<string>('');
  const { mutate: mutateBookmarkFolderData } = useSWRxBookamrkFolderAndChild(true);


  const inputValidator = (title: string | null): AlertInfo | null => {
    if (title == null || title === '' || title.trim() === '') {
      return {
        type: AlertType.WARNING,
        message: t('form_validation.title_required'),
      };
    }
    return null;
  };

  const onPressEnterHandler = async(folderName: string) => {
    setFolderName(folderName);
    try {
      await apiv3Post('/bookmark-folder', { name: folderName, parent: null });
      mutateBookmarkFolderData();
      onClickOutside();
      toastSuccess(t('Create New Bookmark Folder Success'));
    }
    catch (err) {
      toastError(err);
    }
  };
  return (
    <div className="flex-fill">
      <ClosableTextInput
        value={folderName}
        placeholder={t('Input Folder name')}
        onClickOutside={onClickOutside}
        onPressEnter={onPressEnterHandler}
        inputValidator={inputValidator}
      />
    </div>
  );
};


export default BookmarkFolderNameInput;
