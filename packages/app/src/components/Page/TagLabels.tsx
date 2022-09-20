import React, { FC, useState } from 'react';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

type Props = {
  tags?: string[],
  isGuestUser: boolean,
  tagsUpdateInvoked?: (tags: string[]) => Promise<void> | void,
}


const TagLabels:FC<Props> = (props: Props) => {
  const { tags, isGuestUser, tagsUpdateInvoked } = props;

  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const openEditorModal = () => {
    setIsTagEditModalShown(true);
  };

  const closeEditorModal = () => {
    setIsTagEditModalShown(false);
  };

  return (
    <>
      <form className="grw-tag-labels form-inline" data-testid="grw-tag-labels">
        <i className="tag-icon icon-tag mr-2"></i>
        { tags == null
          ? (
            <span className="grw-tag-label badge badge-secondary">―</span>
          )
          : (
            <RenderTagLabels
              tags={tags}
              openEditorModal={openEditorModal}
              isGuestUser={isGuestUser}
            />
          )
        }
      </form>

      <TagEditModal
        tags={tags}
        isOpen={isTagEditModalShown}
        onClose={closeEditorModal}
        onTagsUpdated={tagsUpdateInvoked}
      />
    </>
  );
};

export default TagLabels;
