import React, { FC, useState } from 'react';

import { Skeleton } from '../Skeleton';

import RenderTagLabels from './RenderTagLabels';
import { TagEditModal } from './TagEditModal';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isTagLabelsDisabled: boolean,
  isDisappear: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
  pageId: string,
}

export const PageTagsSkeleton = (): JSX.Element => {
  return <Skeleton additionalClass={`${styles['grw-tag-labels-skeleton']} py-1`} />;
};

export const PageTags:FC<Props> = (props: Props) => {
  const {
    tags, isTagLabelsDisabled, isDisappear, pageId,
  } = props;

  if (tags == null) {
    return <PageTagsSkeleton />;
  }

  return (
    <>
      <div className={`${styles['grw-tag-labels']} grw-tag-labels d-flex align-items-center`} data-testid="grw-tag-labels">
        <RenderTagLabels
          tags={tags}
          isTagLabelsDisabled={isTagLabelsDisabled}
          isDisappear={isDisappear}
          pageId={pageId}
        />
      </div>
    </>
  );
};
