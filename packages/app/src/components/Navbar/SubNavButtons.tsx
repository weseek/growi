import React, {
  FC, useCallback,
} from 'react';
import AppContainer from '../../client/services/AppContainer';
import NavigationContainer from '../../client/services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';
import { useSWRPageInfo } from '../../stores/page';
import { toastError } from '../../client/util/apiNotification';
import { apiv3Put } from '../../client/util/apiv3-client';


type SubNavButtonsProps= {
  appContainer: AppContainer,
  navigationContainer: NavigationContainer,
  isCompactMode?: boolean,
  pageId: string,
}
const SubNavButtons: FC<SubNavButtonsProps> = (props: SubNavButtonsProps) => {
  const {
    appContainer, navigationContainer, isCompactMode, pageId,
  } = props;
  const { editorMode } = navigationContainer.state;
  const isViewMode = editorMode === 'view';
  const { data: pageInfo, error: pageInfoError, mutate: mutatePageInfo } = useSWRPageInfo(pageId);

  const likeClickhandler = useCallback(async() => {
    const { isGuestUser } = appContainer;

    if (isGuestUser) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await apiv3Put('/page/likes', { pageId, bool: !pageInfo!.isLiked });
      mutatePageInfo();
    }
    catch (err) {
      toastError(err);
    }
  }, [pageInfo]);


  if (pageInfoError != null || pageInfo == null) {
    return <></>;
  }
  const { sumOfLikers, likerIds, isLiked } = pageInfo;

  return (
    <>
      {isViewMode && (
        <PageReactionButtons
          pageId={pageId}
          sumOfLikers={sumOfLikers}
          likerIds={likerIds}
          isLiked={isLiked}
          onLikeClicked={likeClickhandler}
        >
        </PageReactionButtons>
      )}
      {/*
        TODO :
        once 80335 is done, merge 77543 branch(parent of 80335) into 77524.
        (pageContainer dependencies in bookmark, delete modal, rename etc are removed)
        then place PageManagement here.
        TASK: https://estoc.weseek.co.jp/redmine/issues/81076
        CONDITION :isAbleToShowPageManagement = !isNotFoundPage && !isTrashPage && !isSharedUser
      */}
      {/* if (CONDITION) then <PageManagement isCompactMode> */}
    </>
  );
};

const SubNavButtonsWrapper = withUnstatedContainers(SubNavButtons, [AppContainer, NavigationContainer]);

export default SubNavButtonsWrapper;
