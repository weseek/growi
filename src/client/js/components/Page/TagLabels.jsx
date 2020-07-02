import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import * as toastr from 'toastr';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';

import TagEditModal from './TagEditModal';

class TagLabels extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showTagEditor: false,
      isTagEditModalShown: false,
    };

    this.showEditorModal = this.showEditorModal.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if isEditorMode is false
   *   2. editorContainer.state.tags if isEditorMode is true
   */
  getEditTargetData() {
    const { isEditorMode } = this.props;
    return (isEditorMode) ? this.props.editorContainer.state.tags : this.props.pageContainer.state.tags;
  }

  showEditorModal() {
    this.setState({ isTagEditModalShown: true });
  }

  async tagsUpdatedHandler(tags) {
    const { appContainer, editorContainer, isEditorMode } = this.props;

    // only update tags in editorContainer
    if (isEditorMode) {
      return editorContainer.setState({ tags });
    }

    // post api request and update tags
    const { pageContainer } = this.props;

    try {
      const { pageId } = pageContainer.state;
      await appContainer.apiPost('/tags.update', { pageId, tags });

      // update pageContainer.state
      pageContainer.setState({ tags });
      editorContainer.setState({ tags });

      this.apiSuccessHandler();
    }
    catch (err) {
      this.apiErrorHandler(err);
      return;
    }
  }

  apiSuccessHandler() {
    toastr.success(undefined, 'updated tags successfully', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '1200',
      extendedTimeOut: '150',
    });
  }

  apiErrorHandler(err) {
    toastr.error(err.message, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  render() {
    const { t } = this.props;
    const { pageId } = this.props.pageContainer.state;

    const tags = this.getEditTargetData();

    const tagElements = tags.map((tag) => {
      return (
        <span key={`${pageId}_${tag}`} className="text-muted">
          <i className="tag-icon icon-tag mr-1"></i>
          <a className="tag-name mr-2" href={`/_search?q=tag:${tag}`} key={`${pageId}_${tag}_link`}>{tag}</a>
        </span>
      );
    });

    return (
      <div className="tag-labels">
        {tags.length === 0 && (
          <a className="btn btn-link btn-edit-tags no-tags p-0 text-muted" onClick={this.showEditorModal}>
            { t('Add tags for this page') } <i className="manage-tags ml-2 icon-plus"></i>
          </a>
        )}
        {tagElements}
        {tags.length > 0 && (
          <a className="btn btn-link btn-edit-tags p-0 text-muted" onClick={this.showEditorModal}>
            <i className="manage-tags ml-2 icon-plus"></i> { t('Edit tags for this page') }
          </a>
        )}
        <TagEditModal
          isOpen={this.state.isTagEditModalShown}
          appContainer={this.props.appContainer}
          show={this.state.showTagEditor}
          onTagsUpdated={this.tagsUpdatedHandler}
        >
        </TagEditModal>
      </div>
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

  isEditorMode: PropTypes.bool,
};

TagLabels.defaultProps = {
  isEditorMode: false,
};

export default withTranslation()(TagLabelsWrapper);
