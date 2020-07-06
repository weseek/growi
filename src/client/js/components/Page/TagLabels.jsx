import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '../../util/apiNotification';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';

import TagEditModal from './TagEditModal';

let tags = null;

class TagLabels extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTagEditModalShown: false,
    };

    this.openEditorModal = this.openEditorModal.bind(this);
    this.closeEditorModal = this.closeEditorModal.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
    this.renderTagLabels = this.renderTagLabels.bind(this);
  }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if isEditorMode is false
   *   2. editorContainer.state.tags if isEditorMode is true
   */
  async getEditTargetData() {
    const { isEditorMode } = this.props;
    return (isEditorMode) ? this.props.editorContainer.state.tags : this.props.pageContainer.state.tags;
  }

  openEditorModal() {
    this.setState({ isTagEditModalShown: true });
  }

  closeEditorModal() {
    this.setState({ isTagEditModalShown: false });
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

      toastSuccess('updated tags successfully');
    }
    catch (err) {
      toastError(err, 'fail to update tags');
    }
  }

  renderTagLabels() {
    const { t } = this.props;
    const { pageId } = this.props.pageContainer.state;

    const timeout = msec => new Promise((resolve) => {
      setTimeout(resolve, msec);
    });

    if (tags !== null) {
      if (tags.length === 0) {
        return (
          <a className="btn btn-link btn-edit-tags no-tags p-0 text-muted" onClick={this.openEditorModal}>
            { t('Add tags for this page') } <i className="manage-tags ml-2 icon-plus"></i>
          </a>
        );
      }

      return (
        <>
          {tags.map((tag) => {
            return (
              <span key={`${pageId}_${tag}`} className="text-muted">
                <i className="tag-icon icon-tag mr-1"></i>
                <a className="tag-name mr-2" href={`/_search?q=tag:${tag}`} key={`${pageId}_${tag}_link`}>{tag}</a>
              </span>
            );
          })}
          <a className="btn btn-link btn-edit-tags p-0 text-muted" onClick={this.openEditorModal}>
            <i className="manage-tags ml-2 icon-plus"></i> { t('Edit tags for this page') }
          </a>
        </>
      );

    }

    throw new Promise(async(resolve) => {
      await timeout(5000);
      tags = await this.getEditTargetData();
      resolve();
    });
  }

  render() {
    const tags = this.getEditTargetData();
    return (
      <React.Fragment>
        <div className="tag-labels">
          <Suspense fallback={<p>Loading...</p>}>
            <this.renderTagLabels />
          </Suspense>
        </div>

        <TagEditModal
          tags={tags}
          isOpen={this.state.isTagEditModalShown}
          onClose={this.closeEditorModal}
          appContainer={this.props.appContainer}
          onTagsUpdated={this.tagsUpdatedHandler}
        />

      </React.Fragment>
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
