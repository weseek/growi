import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import LinkedPagePath from '~/models/linked-page-path';
import { usePageSelectModal } from '~/stores/modal';

import ClosableTextInput from '../Common/ClosableTextInput';
import { PagePathHierarchicalLink } from '../Common/PagePathHierarchicalLink';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import { usePagePathRenameHandler } from './page-header-utils';

import styles from './PagePathHeader.module.scss';

const moduleClass = styles['page-path-header'];


export type Props = {
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { currentPage } = props;

  const dPagePath = new DevidedPagePath(currentPage.path, true);
  const parentPagePath = dPagePath.former;

  const linkedPagePath = new LinkedPagePath(parentPagePath);

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isButtonsShown, setButtonShown] = useState(false);
  const [editingParentPagePath, setEditingParentPagePath] = useState(parentPagePath);

  const { data: PageSelectModalData, open: openPageSelectModal } = usePageSelectModal();
  const isOpened = PageSelectModalData?.isOpened ?? false;

  const pagePathRenameHandler = usePagePathRenameHandler(currentPage);

  const onRenameFinish = useCallback(() => {
    setRenameInputShown(false);
  }, []);

  const onRenameFailure = useCallback(() => {
    setRenameInputShown(true);
  }, []);

  const onInputChange = useCallback((inputText: string) => {
    setEditingParentPagePath(inputText);
  }, []);

  const onPressEnter = useCallback(() => {
    const pathToRename = normalizePath(`${editingParentPagePath}/${dPagePath.latter}`);
    pagePathRenameHandler(pathToRename, onRenameFinish, onRenameFailure);
  }, [editingParentPagePath, onRenameFailure, onRenameFinish, pagePathRenameHandler, dPagePath.latter]);

  const onPressEscape = useCallback(() => {
    // reset
    setEditingParentPagePath(parentPagePath);
    setRenameInputShown(false);
  }, [parentPagePath]);

  const onClickEditButton = useCallback(() => {
    if (isRenameInputShown) {
      const pathToRename = normalizePath(`${editingParentPagePath}/${dPagePath.latter}`);
      pagePathRenameHandler(pathToRename, onRenameFinish, onRenameFailure);
      return;
    }

    // reset
    setEditingParentPagePath(parentPagePath);
    setRenameInputShown(true);
  }, [isRenameInputShown, parentPagePath, editingParentPagePath, dPagePath.latter, pagePathRenameHandler, onRenameFinish, onRenameFailure]);

  const clickOutSideHandler = useCallback((e) => {
    const container = document.getElementById('page-path-header');

    if (container && !container.contains(e.target)) {
      setRenameInputShown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', clickOutSideHandler);

    return () => {
      document.removeEventListener('click', clickOutSideHandler);
    };
  }, [clickOutSideHandler]);


  if (dPagePath.isRoot) {
    return <></>;
  }

  return (
    <div
      id="page-path-header"
      className={`d-flex ${moduleClass}`}
      onMouseEnter={() => setButtonShown(true)}
      onMouseLeave={() => setButtonShown(false)}
    >
      <div className="me-2">
        {isRenameInputShown
          ? (
            <ClosableTextInput
              useAutosizeInput
              value={editingParentPagePath}
              placeholder={t('Input page name')}
              inputClassName="form-control-sm"
              onPressEnter={onPressEnter}
              onPressEscape={onPressEscape}
              onChange={onInputChange}
              validationTarget={ValidationTarget.PAGE}
            />
          )
          : (
            <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />
          )
        }
      </div>

      <div className={`page-path-header-buttons d-flex align-items-center ${isButtonsShown ? '' : 'd-none'}`}>
        <button
          type="button"
          className="btn btn-sm text-muted border border-secondary me-2 d-flex align-items-center justify-content-center"
          onClick={onClickEditButton}
        >
          <span className="material-symbols-outlined fs-5 mt-1">{isRenameInputShown ? 'check_circle' : 'edit'}</span>
        </button>

        <button
          type="button"
          className="btn btn-sm text-muted border border-secondary d-flex align-items-center justify-content-center"
          onClick={openPageSelectModal}
        >
          <span className="material-symbols-outlined fs-5 mt-1">account_tree</span>
        </button>
      </div>

      {isOpened && <PageSelectModal />}
    </div>
  );
};
