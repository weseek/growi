import {
  FC, useMemo, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';
import { usePagePathSubmitHandler } from './page-header-utils';

type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  const { t } = useTranslation();

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();
  const pagePathSubmitHandler = usePagePathSubmitHandler(currentPage, currentPagePath, setRenameInputShown);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  const PagePath = useMemo(() => (
    <>
      {currentPagePath != null && (
        <PagePathNav
          pageId={currentPage._id}
          pagePath={currentPagePath}
          isSingleLineMode={isEditorMode}
        />
      )}
    </>
  ), [currentPage._id, currentPagePath, isEditorMode]);

  const handleInputChange = (inputText: string) => {
    setInputText(inputText);
  };

  const handleEditButtonClick = () => {
    setIsEditing(!isEditing);

    if (isEditing) {
      pagePathSubmitHandler(inputText);
    }
    else {
      setRenameInputShown(true);
    }
  };

  return (
    <>
      <div onMouseLeave={() => setButtonShown(false)}>
        <div className="row">
          <div
            className="col-4"
            onMouseEnter={() => setButtonShown(true)}
          >
            <TextInputForPageTitleAndPath
              currentPagePath={currentPagePath}
              currentPage={currentPage}
              stateHandler={stateHandler}
              inputValue={currentPagePath}
              CustomComponent={PagePath}
              handleInputChange={handleInputChange}
            />
          </div>
          {isButtonsShown
            && (
              <>
                <div className="col-4">
                  <button type="button" onClick={handleEditButtonClick}>
                    {isEditing ? t('Done') : t('Edit')}
                  </button>
                </div>
                <div className="col-4">
                  <button type="button" onClick={openPageSelectModal}>ページツリーボタン</button>
                </div>
              </>
            )}
          {isOpened
            && (
              <PageSelectModal />
            )}
        </div>
      </div>
    </>
  );
};
