import React, {
  FC,
} from 'react';
import AppContainer from '../../client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';

import PageReactionButtons from '../PageReactionButtons';
import PageManagement from '../Page/PageManagement';


type Props = {
  appContainer: AppContainer,
  isCompactMode: boolean,

  pageId: string,
}

const SearchResultSubNavButton : FC<Props> = (props: Props) => {
  const {
    appContainer, isCompactMode, pageId,
  } = props;
  if (pageId == null) return;
  const PageReactionButtonsTypeAny : any = PageReactionButtons;
  return (
    <>
      <PageReactionButtonsTypeAny pageId={pageId} currentUserId={appContainer.currentUserId}></PageReactionButtonsTypeAny>
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

const SearchResultSubNavButtonWrapper = withUnstatedContainers(SearchResultSubNavButton, [AppContainer]);

export default SearchResultSubNavButtonWrapper;
