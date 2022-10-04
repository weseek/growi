import React, { FC, useState } from 'react';

import { Skelton } from '../Skelton';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

import styles from './TagLabels.module.scss';

type Props = {
  tags?: string[],
  isGuestUser: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
}

export const TagLabelsSkelton = (): JSX.Element => {
  return <Skelton additionalClass={`${styles['grw-tag-labels-skelton']} py-1`} />;
};

export const TagLabels:FC<Props> = (props: Props) => {
  const { tags, isGuestUser, tagsUpdateInvoked } = props;

  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const openEditorModal = () => {
    setIsTagEditModalShown(true);
  };

  const closeEditorModal = () => {
    setIsTagEditModalShown(false);
  };

  if (tags == null) {
    return <TagLabelsSkelton />;
  }

  return (
    <>
      <div className={`${styles['grw-tag-labels']} grw-tag-labels d-flex align-items-center`} data-testid="grw-tag-labels">
        <i className="tag-icon icon-tag mr-2"></i>
        <RenderTagLabels
          tags={tags}
          openEditorModal={openEditorModal}
          isGuestUser={isGuestUser}
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
