import React, { useCallback, useState } from 'react';

import { apiPost } from '~/client/js/util/apiv1-client';
import { useCurrentPageSWR, useCurrentPageTagsSWR } from '~/stores/page';
import { useCurrentUser } from '~/stores/context';
import { EditorMode } from '~/stores/ui';

import { toastSuccess, toastError } from '../../util/apiNotification';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

type Props = {
  editorMode: EditorMode,
}

const TagLabels = (props: Props): JSX.Element => {
  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: tags, error, mutate: currentPageTagsMutate } = useCurrentPageTagsSWR();
  const { data: currentPage } = useCurrentPageSWR();

  const openEditorModal = useCallback(() => {
    setIsTagEditModalShown(true);
  }, []);

  const closeEditorModal = useCallback(() => {
    setIsTagEditModalShown(false);
  }, []);
  const tagsUpdatedHandler = useCallback(async(newTags) => {

    const pageId = (currentPage != null && currentPage._id);

    // TODO impl this after editorMode becomes available.
    // It will not be reflected in the DB until the page is refreshed
    if (props.editorMode === EditorMode.Editor) {
      // return props.editorContainer.setState({ tags: newTags });
    }

    try {
      await apiPost('/tags.update', { pageId, tags: newTags });
      currentPageTagsMutate();

      // TODO impl this after editorMode becomes available.
      // update editorContainer.state
      // props.editorContainer.setState({ tags });
      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }, [currentPageTagsMutate, currentPage, props.editorMode]);

  const isLoading = !error && !tags;

  // loading
  if (isLoading) {
    return (
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <span className="grw-tag-label badge badge-secondary">―</span>
      </form>
    );
  }

  const isGuestUser = currentUser == null;

  return (
    <>
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <RenderTagLabels
          tags={tags}
          openEditorModal={openEditorModal}
          isGuestUser={isGuestUser}
        />
      </form>

      <TagEditModal
        tags={tags}
        isOpen={isTagEditModalShown}
        onClose={closeEditorModal}
        onTagsUpdated={tagsUpdatedHandler}
      />
    </>
  );
};

export default TagLabels;
