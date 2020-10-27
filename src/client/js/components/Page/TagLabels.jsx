import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../util/apiNotification';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';

import RenderTagLabels from './RenderTagLabels';
import TagEditModal from './TagEditModal';

class TagLabels extends React.Component {

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
    const { editorContainer, pageContainer, editorMode } = this.props;
    return (editorMode === 'edit') ? editorContainer.state.tags : pageContainer.state.tags;
  }

  openEditorModal() {
    this.setState({ isTagEditModalShown: true });
  }

  closeEditorModal() {
    this.setState({ isTagEditModalShown: false });
  }

  async tagsUpdatedHandler(newTags) {
    const {
      appContainer, editorContainer, pageContainer, editorMode,
    } = this.props;

    const { pageId } = pageContainer.state;

    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === 'edit') {
      return editorContainer.setState({ tags: newTags });
    }

    try {
      const { tags } = await appContainer.apiPost('/tags.update', { pageId, tags: newTags });

      // update pageContainer.state
      pageContainer.setState({ tags });
      // update editorContainer.state
      editorContainer.setState({ tags });

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }


  render() {
    const tags = this.getTagData();

    return (
      <>

        <form className="grw-tag-labels form-inline">
          <i className="tag-icon icon-tag mr-2"></i>
          <Suspense fallback={<span className="grw-tag-label badge badge-secondary">―</span>}>
            <RenderTagLabels
              tags={tags}
              openEditorModal={this.openEditorModal}
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
const TagLabelsWrapper = withUnstatedContainers(TagLabels, [AppContainer, PageContainer, EditorContainer]);

TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  editorMode: PropTypes.string.isRequired,
};

export default withTranslation()(TagLabelsWrapper);
