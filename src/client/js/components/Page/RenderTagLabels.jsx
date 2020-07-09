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
      {tagElements}

      <a className={`btn btn-link btn-edit-tags p-0 text-muted ${isTagsEmpty ? 'no-tags' : ''}`} onClick={openEditorHandler}>
        { isTagsEmpty
          ? (
            <>{ t('Add tags for this page') }<i className="ml-1 icon-plus"></i></>
          )
          : (
            <i className="icon-plus"></i>
          )
        }
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
