import React, { FC, useState } from 'react';

import { Skeleton } from '../Skeleton';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isTagLabelsDisabled: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
}

export const TagLabelsSkeleton = (): JSX.Element => {
  return <Skeleton additionalClass={`${styles['grw-tag-labels-skeleton']} py-1`} />;
};

export const TagLabels:FC<Props> = (props: Props) => {
  const { tags, isTagLabelsDisabled, tagsUpdateInvoked } = props;

  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const openEditorModal = () => {
    setIsTagEditModalShown(true);
  };

  const closeEditorModal = () => {
    setIsTagEditModalShown(false);
  };

  if (tags == null) {
    return <TagLabelsSkeleton />;
  }

  return (
    <>
      <div className={`${styles['grw-tag-labels']} grw-tag-labels d-flex align-items-center`} data-testid="grw-tag-labels">
        <i className="tag-icon icon-tag mr-2"/>
        <RenderTagLabels
          tags={tags}
          openEditorModal={openEditorModal}
          isTagLabelsDisabled={isTagLabelsDisabled}
        />
      </div>
      <TagEditModal
        tags={tags}
        isOpen={isTagEditModalShown}
        onClose={closeEditorModal}
        onTagsUpdated={tagsUpdateInvoked}
      />
    </>
  );
};
