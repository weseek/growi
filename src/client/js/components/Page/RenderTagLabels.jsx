import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';

function RenderTagLabels(props) {
  const { t, tags, pageContainer } = props;
  const { pageId } = pageContainer;

  function openEditorHandler() {
    if (props.openEditorModal == null) {
      return;
    }
    props.openEditorModal();
  }

  // activate suspense
  if (tags == null) {
    throw new Promise(() => {});
  }

  if (tags.length === 0) {
    return (
      <a className="btn btn-link btn-edit-tags no-tags p-0 text-muted" onClick={openEditorHandler}>
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
      <a className="btn btn-link btn-edit-tags p-0 text-muted" onClick={openEditorHandler}>
        <i className="manage-tags ml-2 icon-plus"></i> { t('Edit tags for this page') }
      </a>
    </>
  );

}

/**
 * Wrapper component for using unstated
 */
const RenderTagLabelsWrapper = withUnstatedContainers(RenderTagLabels, [PageContainer]);


RenderTagLabels.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  tags: PropTypes.array,
  openEditorModal: PropTypes.func,

  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

};

export default withTranslation()(RenderTagLabelsWrapper);
