import React from 'react';

import { Skeleton } from '~/components/Skeleton';

import styles from '../Tag.module.scss';

export const TagListSkeleton = (): JSX.Element => {
  return (
    <Skeleton additionalClass={`${styles['grw-tag-list-skeleton']} w-100 rounded overflow-hidden`} />
  );
};

const TagContentSkeleton = (): JSX.Element => {

  return (
    <>
      <Skeleton additionalClass={`${styles['grw-tag-skeleton-h3']} my-3`} />
      <TagListSkeleton />
    </>
  );
};

export default TagContentSkeleton;
