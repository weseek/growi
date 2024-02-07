import type { FC } from 'react';
import React from 'react';

import { useTranslation } from 'next-i18next';

import { Skeleton } from '../Skeleton';

import RenderTagLabels from './RenderTagLabels';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isTagLabelsDisabled: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
  onClickEditTagsButton: () => void,
  tagLabelsMaxWidth?: number
}

export const PageTagsSkeleton = (): JSX.Element => {
  return <Skeleton additionalClass={`${styles['grw-tag-labels-skeleton']} py-1`} />;
};

export const PageTags:FC<Props> = (props: Props) => {
  const {
    tags, isTagLabelsDisabled, onClickEditTagsButton, tagLabelsMaxWidth,
  } = props;

  const { t } = useTranslation();

  if (tags == null) {
    return <></>;
  }

  const printNoneClass = tags.length === 0 ? 'd-print-none' : '';

  return (
    <>
      <div className={`${styles['grw-tag-labels']} grw-tag-labels d-flex align-items-center ${printNoneClass}`} data-testid="grw-tag-labels">
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary rounded-pill mb-2 d-flex d-lg-none ${styles['grw-tag-icon-button']}`}
          onClick={onClickEditTagsButton}
        >
          <span className="material-symbols-outlined">local_offer</span>
        </button>
        <div className="d-none d-lg-flex row">
          <div className="col mb-2">
            <div>
              <span className="material-symbols-outlined">local_offer</span>
              <span>{t('Tags')}</span>
            </div>
            <RenderTagLabels
              tags={tags}
              isTagLabelsDisabled={isTagLabelsDisabled}
              onClickEditTagsButton={onClickEditTagsButton}
              tagLabelsMaxWidth={tagLabelsMaxWidth}
            />
          </div>
        </div>
      </div>
    </>
  );
};
