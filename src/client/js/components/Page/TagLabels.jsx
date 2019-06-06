import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import * as toastr from 'toastr';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import EditorContainer from '../../services/EditorContainer';

import TagEditor from './TagEditor';

class TagLabels extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showTagEditor: false,
    };

    this.showEditor = this.showEditor.bind(this);
    this.tagsUpdatedHandler = this.tagsUpdatedHandler.bind(this);
  }

  /**
   * @return tags data
   *   1. pageContainer.state.tags if editorMode is null
   *   2. editorContainer.state.tags if editorMode is not null
   */
  getEditTargetData() {
    const { editorMode } = this.props.appContainer.state;
    return (editorMode == null)
      ? this.props.pageContainer.state.tags
      : this.props.editorContainer.state.tags;
  }

  showEditor() {
    this.tagEditor.show(this.getEditTargetData());
  }

  async tagsUpdatedHandler(tags) {
    const { appContainer, editorContainer } = this.props;
    const { editorMode } = appContainer.state;

    // post api request and update tags
    if (editorMode == null) {
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
    // only update tags in editorContainer
    else {
      editorContainer.setState({ tags });
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
      <div className={`tag-viewer ${pageId ? 'existed-page' : 'new-page'}`}>
        {tags.length === 0 && (
          <a className="btn btn-link btn-edit-tags no-tags p-0" onClick={this.showEditor}>
            { t('Add tags for this page') } <i className="manage-tags ml-2 icon-plus"></i>
          </a>
        )}
        {tagElements}
        {tags.length > 0 && (
          <a className="btn btn-link btn-edit-tags p-0" onClick={this.showEditor}>
            <i className="manage-tags ml-2 icon-plus"></i> { t('Edit tags for this page') }
          </a>
        )}

        <TagEditor
          ref={(c) => { this.tagEditor = c }}
          appContainer={this.props.appContainer}
          show={this.state.showTagEditor}
          onTagsUpdated={this.tagsUpdatedHandler}
        >
        </TagEditor>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsWrapper = (props) => {
  return createSubscribedElement(TagLabels, props, [AppContainer, PageContainer, EditorContainer]);
};


TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withTranslation()(TagLabelsWrapper);
