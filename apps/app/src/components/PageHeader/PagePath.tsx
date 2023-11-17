import { FC, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';

import { usePageSelectModal } from '~/stores/modal';

import { TextInputForPageTitleAndPath } from './TextInputForPageTitleAndPath';


type Props = {
  currentPagePath: string
  currentPage: IPagePopulatedToShowRevision
}

export const PagePath: FC<Props> = (props) => {
  const { currentPagePath, currentPage } = props;

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);

  const { open: openPageSelectModal, close: closePageSelectModal } = usePageSelectModal();

  const stateHandler = { isRenameInputShown, setRenameInputShown };

  return (
    <>
      <div className="container">
        <div className="row">
          <div
            className="col-4"
            onMouseEnter={() => setButtonShown(true)}
            onMouseLeave={() => setButtonShown(false)}
          >
            <TextInputForPageTitleAndPath
              currentPagePath={currentPagePath}
              currentPage={currentPage}
              stateHandler={stateHandler}
              inputValue={currentPagePath}
            />
          </div>
          { isButtonsShown
          && (
            <>
              <div className="col-4">
                <button type="button">編集ボタン</button>
              </div>
              <div className="col-4">
                <button type="button" onClick={openPageSelectModal}>ページツリーボタン</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
