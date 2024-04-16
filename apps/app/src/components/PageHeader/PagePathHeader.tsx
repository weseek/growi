import {
  useState, useCallback, memo,
} from 'react';

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
  currentPage: IPagePopulatedToShowRevision,
  className?: string,
  maxWidth?: number,
}

export const PagePathHeader = memo((props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { currentPage, className, maxWidth } = props;

  const dPagePath = new DevidedPagePath(currentPage.path, true);
  const parentPagePath = dPagePath.former;

  const linkedPagePath = new LinkedPagePath(parentPagePath);

  const [isRenameInputShown, setRenameInputShown] = useState(false);
  const [isHover, setHover] = useState(false);
  const [editingParentPagePath, setEditingParentPagePath] = useState(parentPagePath);

  // const [isIconHidden, setIsIconHidden] = useState(false);

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

  // TODO: https://redmine.weseek.co.jp/issues/141062
  // Truncate left side and don't use getElementById
  //
  // useEffect(() => {
  //   const areaElem = document.getElementById('grw-page-path-header-container');
  //   const linkElem = document.getElementById('grw-page-path-hierarchical-link');

  //   const areaElemWidth = areaElem?.offsetWidth;
  //   const linkElemWidth = linkElem?.offsetWidth;

  //   if (areaElemWidth && linkElemWidth) {
  //     setIsIconHidden(linkElemWidth > areaElemWidth);
  //   }
  //   else {
  //     setIsIconHidden(false);
  //   }
  // }, [currentPage]);
  //
  // const styles: CSSProperties | undefined = isIconHidden ? { direction: 'rtl' } : undefined;

  if (dPagePath.isRoot) {
    return <></>;
  }

  return (
    <div
      id="page-path-header"
      className={`d-flex ${moduleClass} ${className ?? ''} small position-relative ms-2`}
      style={{ maxWidth }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        id="grw-page-path-header-container"
        className="d-inline-block overflow-hidden"
      >
        { isRenameInputShown && (
          <div className="position-absolute w-100">
            <ClosableTextInput
              value={editingParentPagePath}
              placeholder={t('Input parent page path')}
              inputClassName="form-control-sm"
              onPressEnter={onPressEnter}
              onPressEscape={onPressEscape}
              onChange={onInputChange}
              validationTarget={ValidationTarget.PAGE}
              onClickOutside={onPressEscape}
            />
          </div>
        ) }
        <div
          className={`${isRenameInputShown ? 'invisible' : ''} text-truncate`}
          // style={styles}
        >
          <PagePathHierarchicalLink
            linkedPagePath={linkedPagePath}
            // isIconHidden={isIconHidden}
          />
        </div>
      </div>

      <div
        className={`page-path-header-buttons d-flex align-items-center ${isHover && !isRenameInputShown ? '' : 'invisible'}`}
      >
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
});
