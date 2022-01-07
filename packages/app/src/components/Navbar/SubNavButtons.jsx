import React from 'react';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';
import { usePageId } from '~/stores/context';
import { EditorMode, useEditorMode } from '~/stores/ui';
import { withUnstatedContainers } from '../UnstatedUtils';

import BookmarkButtons from '../BookmarkButtons';
import LikeButtons from '../LikeButtons';
import SubscribeButton from '../SubscribeButton';
import PageManagement from '../Page/PageManagement';

const SubnavButtons = React.memo((props) => {
  const {
    appContainer, pageContainer, isCompactMode,
  } = props;

  const { data: pageId } = usePageId();
  const { data: editorMode } = useEditorMode();

  /* eslint-disable react/prop-types */
  const PageReactionButtons = ({ pageContainer }) => {

    return (
      <>
        <span>
          <SubscribeButton pageId={pageId} />
        </span>
        {pageContainer.isAbleToShowLikeButtons && (
          <span>
            <LikeButtons />
          </span>
        )}
        <span>
          <BookmarkButtons page={pageId} />
        </span>
      </>
    );
  };
  /* eslint-enable react/prop-types */

  const isViewMode = editorMode === EditorMode.View;

  return (
    <>
      {isViewMode && (
        <>
          {pageContainer.isAbleToShowPageReactionButtons && <PageReactionButtons appContainer={appContainer} pageContainer={pageContainer} />}
          {pageContainer.isAbleToShowPageManagement && <PageManagement isCompactMode={isCompactMode} />}
        </>
      )}
    </>
  );
});

/**
 * Wrapper component for using unstated
 */
const SubnavButtonsWrapper = withUnstatedContainers(SubnavButtons, [AppContainer, PageContainer]);


SubnavButtons.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isCompactMode: PropTypes.bool,
};

export default SubnavButtonsWrapper;
