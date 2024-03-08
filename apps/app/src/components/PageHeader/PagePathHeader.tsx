import {
  useState, useEffect, useCallback,
} from 'react';
import type { CSSProperties, FC } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { normalizePath } from '@growi/core/dist/utils/path-utils';
import { useTranslation } from 'next-i18next';

import { ValidationTarget } from '~/client/util/input-validator';
import LinkedPagePath from '~/models/linked-page-path';
import { usePageSelectModal } from '~/stores/modal';

import ClosableTextInput from '../Common/ClosableTextInput';
import { PagePathHierarchicalLink } from '../Common/PagePathHierarchicalLink';
import { usePagePathRenameHandler } from '../PageEditor/page-path-rename-utils';
import { PageSelectModal } from '../PageSelectModal/PageSelectModal';

import styles from './PagePathHeader.module.scss';

const moduleClass = styles['page-path-header'];


type Props = {
  currentPage: IPagePopulatedToShowRevision
}

export const PagePathHeader: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { currentPage } = props;

  const dPagePath = new DevidedPagePath(currentPage.path, true);
  const parentPagePath = dPagePath.former;

  const linkedPagePath = new LinkedPagePath(parentPagePath);

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isHover, setHover] = useState(false);
  const [editingParentPagePath, setEditingParentPagePath] = useState(parentPagePath);

  const [subNavElemWidth, setSubNavElemWidth] = useState(0);

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
    // reset
    setEditingParentPagePath(parentPagePath);
    setRenameInputShown(true);
  }, [parentPagePath]);

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

  const linkElem = document.getElementById('grw-page-path-hierarchical-link');
  const areaElem = document.getElementById('grw-page-path-header-container');

  const linkElemWidth = linkElem?.offsetWidth ?? 0;
  const areaElemWidth = areaElem?.offsetWidth ?? 0;

  const styles: CSSProperties | undefined = linkElemWidth > areaElemWidth ? { direction: 'rtl' } : undefined;

  useEffect(() => {
    const subNavElem = document.getElementById('grw-contextual-sub-nav');
    if (subNavElem) {
      setSubNavElemWidth(subNavElem.offsetWidth);
    }
  }, []);

  const pagePathHeaderWidth = `calc(100% - ${subNavElemWidth}px)`;

  if (dPagePath.isRoot) {
    return <></>;
  }

  return (
    <div
      id="page-path-header"
      className={`d-flex ${moduleClass} small`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: pagePathHeaderWidth }}
    >
      <div
        id="grw-page-path-header-container"
        className="me-2 position-relative"
        style={{ minWidth: 0 }}
      >
        { isRenameInputShown && (
          <div className="position-absolute w-100">
            <ClosableTextInput
              value={editingParentPagePath}
              placeholder={t('Input page name')}
              inputClassName="form-control-sm"
              onPressEnter={onPressEnter}
              onPressEscape={onPressEscape}
              onChange={onInputChange}
              validationTarget={ValidationTarget.PAGE}
            />
          </div>
        ) }
        <div
          className={`${isRenameInputShown ? 'invisible' : ''} text-truncate`}
          style={styles}
        >
          <PagePathHierarchicalLink
            linkedPagePath={linkedPagePath}
            isIconHidden={linkElemWidth > areaElemWidth}
          />
        </div>
      </div>

      <div className={`page-path-header-buttons d-flex align-items-center ${isHover && !isRenameInputShown ? '' : 'invisible'}`}>
        <button
          type="button"
          className="btn btn-outline-neutral-secondary me-2 d-flex align-items-center justify-content-center"
          onClick={onClickEditButton}
        >
          <span className="material-symbols-outlined fs-6">edit</span>
        </button>

        <button
          type="button"
          className="btn btn-outline-neutral-secondary d-flex align-items-center justify-content-center"
          onClick={openPageSelectModal}
        >
          <span className="material-symbols-outlined fs-6">account_tree</span>
        </button>
      </div>

      {isOpened && <PageSelectModal />}
    </div>
  );
};
