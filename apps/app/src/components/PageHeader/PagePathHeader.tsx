import { FC, useCallback, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { usePageSelectModal } from '~/stores/modal';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { PagePathNav } from '../Common/PagePathNav';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';


type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  const isOpened = PageSelectModalData?.isOpened ?? false;

  const isViewMode = editorMode === EditorMode.View;
  const isEditorMode = !isViewMode;

  const PagePath = useCallback(() => {
    return (
      <>
        { currentPagePath != null && (
          <PagePathNav
            pageId={currentPage._id}
            pagePath={currentPagePath}
            isSingleLineMode={isEditorMode}
          />
        )}
      </>
    );
  }, []);

  return (
    <>
      <div className="container">
        <div
          className="row"
          onMouseEnter={() => setButtonShown(true)}
          onMouseLeave={() => setButtonShown(false)}
        >
          <div className="col-4">
            <TextInputForPageTitleAndPath
              currentPagePath={currentPagePath}
              currentPage={currentPage}
              stateHandler={stateHandler}
              inputValue={currentPagePath}
              CustomComponent={PagePath}
            />
          </div>
          { isButtonsShown
          && (
            <>
              <div className="col-4">
                <button type="button" onClick={() => setRenameInputShown(true)}>編集ボタン</button>
              </div>
              <div className="col-4">
                <button type="button" onClick={openPageSelectModal}>ページツリーボタン</button>
              </div>
            </>
          )}
          { isOpened
          && (
            <PageSelectModal />
          )}
        </div>
      </div>
    </>
  );
};
