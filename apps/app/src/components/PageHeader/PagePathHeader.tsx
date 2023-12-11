import { FC, useCallback, useState } from 'react';

import nodePath from 'path';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { usePageSelectModal } from '~/stores/modal';
import { useSWRMUTxCurrentPage } from '~/stores/page';
import { mutatePageTree, mutatePageList } from '~/stores/page-listing';
import { mutateSearching } from '~/stores/search';
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

  const { t } = useTranslation();

  const { data: editorMode } = useEditorMode();
  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();

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
  }, [currentPage._id, currentPagePath, isEditorMode]);

  const onRenamed = useCallback((fromPath: string | undefined, toPath: string) => {

    mutatePageTree();
    mutateSearching();
    mutatePageList();

    if (currentPagePath === fromPath || currentPagePath === toPath) {
      mutateCurrentPage();
    }
  }, [currentPagePath, mutateCurrentPage]);

  if (currentPage == null) {
    return <></>;
  }

  const onPressEnterForRenameHandler = async(inputText: string) => {
    const parentPath = pathUtils.addTrailingSlash(nodePath.dirname(currentPage.path ?? ''));
    const newPagePath = nodePath.resolve(parentPath, inputText);

    if (newPagePath === currentPage.path) {
      setRenameInputShown(false);
      return;
    }

    try {
      setRenameInputShown(false);
      await apiv3Put('/pages/rename', {
        pageId: currentPage._id,
        revisionId: currentPage.revision._id,
        newPagePath,
      });

      if (onRenamed != null) {
        onRenamed(currentPage.path, newPagePath);
      }

      toastSuccess(t('renamed_pages', { path: currentPage.path }));
    }
    catch (err) {
      setRenameInputShown(true);
      toastError(err);
    }
  };

  return (
    <>
      <div className="container">
        <div
          className="row"
          onMouseEnter={() => setButtonShown(true)}
          onMouseLeave={() => setButtonShown(false)}
        >
          <form onSubmit={() => onPressEnterForRenameHandler}>
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
                  {
                    isRenameInputShown
                      ? <button type="submit" onClick={() => setRenameInputShown(false)}>完了ボタン</button>
                      : <button type="button" onClick={() => setRenameInputShown(true)}>編集ボタン</button>
                  }
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
          </form>
        </div>
      </div>
    </>
  );
};
