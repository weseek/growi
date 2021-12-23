import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';
import { EditorMode } from '~/stores/ui';
import { usePageTags } from '~/stores/editor';

class TagLabelsCore extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTagEditModalShown: false,
    };

    this.openEditorModal = this.openEditorModal.bind(this);
    this.closeEditorModal = this.closeEditorModal.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if editorMode is view
   *   2. editorContainer.state.tags if editorMode is edit
   */
  getTagData() {
    // TODO: Migrate pageContainer.state.tags to SWR
    const {
      pageContainer, editorMode, editorContainerTags,
    } = this.props;
    return (editorMode === EditorMode.Editor) ? editorContainerTags : pageContainer.state.tags;
  }

  openEditorModal() {
    this.setState({ isTagEditModalShown: true });
  }

  closeEditorModal() {
    this.setState({ isTagEditModalShown: false });
  }

  async tagsUpdatedHandler(newTags) {
    const {
      appContainer, pageContainer, editorMode, mutateEditorContainerTags,
    } = this.props;

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
  }


  render() {
    const tags = this.getTagData();
    const { appContainer } = this.props;

    return (
      <>

        <form className="grw-tag-labels form-inline">
          <i className="tag-icon icon-tag mr-2"></i>
          <Suspense fallback={<span className="grw-tag-label badge badge-secondary">―</span>}>
            <RenderTagLabels
              tags={tags}
              openEditorModal={this.openEditorModal}
              isGuestUser={appContainer.isGuestUser}
            />
          </Suspense>
        </form>

        <TagEditModal
          tags={tags}
          isOpen={this.state.isTagEditModalShown}
          onClose={this.closeEditorModal}
          appContainer={this.props.appContainer}
          onTagsUpdated={this.tagsUpdatedHandler}
        />

      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsWithUnstated = withUnstatedContainers(TagLabelsCore, [AppContainer, PageContainer]);

const TagLabels = (props) => {
  const { data: editorContainerTags, mutate: mutateEditorContainerTags } = usePageTags();
  return (
    <TagLabelsWithUnstated
      {...props}
      editorContainerTags={editorContainerTags}
      mutateEditorContainerTags={mutateEditorContainerTags}
    />
  );
};

export default TagLabels;

TagLabelsCore.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  editorMode: PropTypes.string,
  editorContainerTags: PropTypes.arrayOf(PropTypes.string),
  mutateEditorContainerTags: PropTypes.func,
};
