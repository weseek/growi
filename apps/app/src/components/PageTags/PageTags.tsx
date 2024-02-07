import type { FC } from 'react';
import React from 'react';

import { useTranslation } from 'next-i18next';

import { NotAvailableForGuest } from '../NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '../NotAvailableForReadOnlyUser';
import { Skeleton } from '../Skeleton';

import RenderTagLabels from './RenderTagLabels';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isTagLabelsDisabled: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
  onClickEditTagsButton: () => void,
}

export const PageTagsSkeleton = (): JSX.Element => {
  return <Skeleton additionalClass={`${styles['grw-tag-labels-skeleton']} py-1`} />;
};

export const PageTags:FC<Props> = (props: Props) => {
  const {
    tags, isTagLabelsDisabled, onClickEditTagsButton,
  } = props;
  const { t } = useTranslation();

  if (tags == null) {
    return <></>;
  }

  const isTagsEmpty = tags.length === 0;
  const printNoneClass = isTagsEmpty ? 'd-print-none' : '';

  return (
    <>
      <div className={`${styles['grw-tag-labels']} grw-tag-labels d-flex align-items-center mb-2 ${printNoneClass}`} data-testid="grw-tag-labels">
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary rounded-pill d-flex d-lg-none ${styles['grw-tag-icon-button']}`}
          onClick={onClickEditTagsButton}
        >
          <span className="material-symbols-outlined">local_offer</span>
        </button>
        <div className="d-none d-lg-flex row">
          <div className="col text-secondary">
            <span className="material-symbols-outlined me-1">local_offer</span>
            <span className="me-1">{t('Tags')}</span>
            <NotAvailableForGuest>
              <NotAvailableForReadOnlyUser>
                <span id="edit-tags-btn-wrapper-for-tooltip">
                  <a
                    className={
                      `btn btn-link btn-edit-tags text-muted
                        ${isTagsEmpty && 'no-tags'}
                        ${isTagLabelsDisabled && 'disabled'}`
                    }
                    onClick={onClickEditTagsButton}
                  >
                    {isTagsEmpty && <span className="me-1">{ t('Add tags for this page') }</span>}
                    <i className="icon-plus" />
                  </a>
                </span>
              </NotAvailableForReadOnlyUser>
            </NotAvailableForGuest>
          </div>
          <div className="d-flex flex-wrap align-items-center">
            <RenderTagLabels tags={tags} />
          </div>
        </div>
      </div>
    </>
  );
};
