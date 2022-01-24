import React, { FC, Suspense, useState } from 'react';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

type TagLabels = {
  appContainer: AppContainer,
  tagsUpdateInvoked: any,
  tags: string[],
}


const TagLabels:FC<TagLabels> = (props:TagLabels) => {
  const {
    appContainer, tagsUpdateInvoked,
  } = props;
  const tags = props.tags;
  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const openEditorModal = () => {
    setIsTagEditModalShown(true);
  };

  const closeEditorModal = () => {
    setIsTagEditModalShown(false);
  };

  return (
    <>
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <Suspense fallback={<span className="grw-tag-label badge badge-secondary">―</span>}>
          <RenderTagLabels
            tags={tags}
            openEditorModal={openEditorModal}
            isGuestUser={appContainer.isGuestUser}
          />
        </Suspense>
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

/**
 * Wrapper component for using unstated
 */
const TagLabelsUnstatedWrapper = withUnstatedContainers(TagLabels, [AppContainer]);

export default TagLabelsUnstatedWrapper;
