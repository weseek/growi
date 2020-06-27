import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import * as toastr from 'toastr';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import NavigationContainer from '../../services/NavigationContainer';
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
    const { editorMode } = this.props.navigationContainer.state;
    return (editorMode == null)
      ? this.props.pageContainer.state.tags
      : this.props.editorContainer.state.tags;
  }

  showEditor() {
    this.tagEditor.show(this.getEditTargetData());
  }

  async tagsUpdatedHandler(tags) {
    const { appContainer, navigationContainer, editorContainer } = this.props;
    const { editorMode } = navigationContainer.state;

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
    const isTagsEmpty = tags.length === 0;

    const tagElements = tags.map((tag) => {
      return (
        <a key={`${pageId}_${tag}`} href={`/_search?q=tag:${tag}`} className="grw-tag-label badge badge-secondary mr-2">
          {tag}
        </a>
      );
    });

    return (
      <>
        <form className="grw-tag-labels form-inline">
          <i className="tag-icon icon-tag mr-2"></i>

          {tagElements}

          <a className={`btn btn-link btn-edit-tags p-0 text-muted ${isTagsEmpty ? 'no-tags' : ''}`} onClick={this.showEditor}>
            { isTagsEmpty
              ? (
                <>{ t('Add tags for this page') }<i className="ml-1 icon-plus"></i></>
              )
              : (
                <i className="icon-plus"></i>
              )
            }
          </a>
        </form>

        <TagEditor
          ref={(c) => { this.tagEditor = c }}
          appContainer={this.props.appContainer}
          show={this.state.showTagEditor}
          onTagsUpdated={this.tagsUpdatedHandler}
        />
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const TagLabelsWrapper = withUnstatedContainers(TagLabels, [AppContainer, NavigationContainer, PageContainer, EditorContainer]);


TagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withTranslation()(TagLabelsWrapper);
