import React, { FC } from 'react';

import { Skeleton } from '../Skeleton';

import RenderTagLabels from './RenderTagLabels';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isTagLabelsDisabled: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
  openTagEditModal?: () => void;
}

export const PageTagsSkeleton = (): JSX.Element => {
  return <Skeleton additionalClass={`${styles['grw-tag-labels-skeleton']} py-1`} />;
};

export const PageTags:FC<Props> = (props: Props) => {
  const {
    tags, isTagLabelsDisabled, openTagEditModal,
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
          openTagEditModal={openTagEditModal}
        />
      </div>
    </>
  );
};
