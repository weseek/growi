import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';
import PageContainer from '~/client/services/PageContainer';
import { EditorMode } from '~/stores/ui';
import { toastError, toastSuccess } from '~/client/util/apiNotification';

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

    const { pageId, revisionId } = pageContainer.state;
    // It will not be reflected in the DB until the page is refreshed
    if (editorMode === EditorMode.Editor) {
      return editorContainer.setState({ tags: newTags });
    }
    try {
      const { tags, savedPage } = await appContainer.apiPost('/tags.update', {
        pageId, tags: newTags, revisionId,
      });
      editorContainer.setState({ tags });
      pageContainer.updatePageMetaData(savedPage, savedPage.revision, tags);
      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }


  render() {
    const { appContainer, tagsUpdateInvoked, tags } = this.props;

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
          onTagsUpdated={tagsUpdateInvoked}
        />

      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsUnstatedWrapper = withUnstatedContainers(TagLabels, [AppContainer, EditorContainer, PageContainer]);

TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorMode: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(String),
  tagsUpdateInvoked: PropTypes.func,
};

// wrapping tsx component returned by withUnstatedContainers to avoid type error when this component used in other tsx components.
const TagLabelsWrapper = (props) => {
  return <TagLabelsUnstatedWrapper {...props}></TagLabelsUnstatedWrapper>;
};
export default withTranslation()(TagLabelsWrapper);
