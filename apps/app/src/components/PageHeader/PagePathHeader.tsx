import { FC, useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

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
  const [isEditButton, setEditButton] = useState(true);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();
  const pagePathSubmitHandler = usePagePathSubmitHandler(currentPage, currentPagePath, setRenameInputShown);

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  const PagePath = useCallback(() => {
    return (
      <>
        {currentPagePath != null && (
          <PagePathNav
            pageId={currentPage._id}
            pagePath={currentPagePath}
            isSingleLineMode={isEditorMode}
          />
        )}
      </>
    );
  }, [currentPage._id, currentPagePath, isEditorMode]);

  const handleInputChange = (inputText: string) => {
    setInputText(inputText);
  };

  const handleFinishButtonClick = () => {
    pagePathSubmitHandler(inputText);
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
                  {
                    isEditButton
                      ? <button type="button" onClick={() => { setRenameInputShown(true); setEditButton(false) }}>編集ボタン</button>
                      : <button type="button" onClick={() => { setEditButton(true); handleFinishButtonClick() }}>完了ボタン</button>
                  }
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
