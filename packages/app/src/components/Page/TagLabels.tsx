/* eslint-disable react/prop-types */
import React, { FC, Suspense, useState } from 'react';

import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';
import { EditorMode } from '~/stores/ui';
import { usePageTags } from '~/stores/editor';

type TagLabelsCoreProps = {
  appContainer: AppContainer;
  pageContainer: PageContainer;
  editorMode: string;
};

const TagLabelsCore: FC<TagLabelsCoreProps> = (props) => {
  const { data: editorContainerTags = [], mutate: mutateEditorContainerTags } = usePageTags();
  const [isTagEditModalShown, setIsTagEditModalShown] = useState(false);

  const { pageContainer, appContainer, editorMode } = props;

  /**
   * @return tags data
   *   1. pageContainer.state.tags if editorMode is view
   *   2. editorContainer.state.tags if editorMode is edit
   */
  const tags = (editorMode === EditorMode.Editor) ? editorContainerTags : pageContainer.state.tags;

  const tagsUpdatedHandler = async(newTags) => {
    const { pageId } = pageContainer.state;

    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === EditorMode.Editor) {
      return mutateEditorContainerTags(newTags);
    }

    try {
      const { tags } = await appContainer.apiPost('/tags.update', { pageId, tags: newTags });

      // update pageContainer.state
      pageContainer.setState({ tags });
      // update editorContainer tags
      mutateEditorContainerTags(tags);

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  };

  return (
    <>
      <form className="grw-tag-labels form-inline">
        <i className="tag-icon icon-tag mr-2"></i>
        <Suspense fallback={<span className="grw-tag-label badge badge-secondary">―</span>}>
          <RenderTagLabels
            tags={tags}
            openEditorModal={() => setIsTagEditModalShown(true)}
            isGuestUser={appContainer.isGuestUser}
          />
        </Suspense>
      </form>

      <TagEditModal
        tags={tags}
        isOpen={isTagEditModalShown}
        onClose={() => setIsTagEditModalShown(false)}
        onTagsUpdated={tagsUpdatedHandler}
      />
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const TagLabelsWithUnstated = withUnstatedContainers(TagLabelsCore, [AppContainer, PageContainer]);

export default TagLabelsWithUnstated;
