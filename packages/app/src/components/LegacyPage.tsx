import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. renderSearchForm
// 2. renderSort
// 3. message props to SearchPageLayout.
const LegacyPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  // migrate modal
  const renderActionsToPageModal = (isActionConfirmModalShown, getSelectedPagesForAction, closeActionConfirmModalHandler) => {
    return (
      <PageMigrateModal
        isOpen={isActionConfirmModalShown}
        pages={getSelectedPagesForAction()}
        onClose={closeActionConfirmModalHandler}
      />
    );
  };

  const renderActionToPages = (isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionAllButton, onClickSelectAllCheckbox) => {
    // no icon for migration
    const actionIconAndText = (
      <>
        Migrate
      </>
    );
    return (
      <ActionToSelectedPageGroup
        isSelectAllCheckboxDisabled={isSelectAllCheckboxDisabled}
        selectAllCheckboxType={selectAllCheckboxType}
        onClickActionAllButton={onClickActionAllButton}
        onClickSelectAllCheckbox={onClickSelectAllCheckbox}
        actionIconAndText={actionIconAndText}
      >
      </ActionToSelectedPageGroup>
    );
  };

  const renderSearchForm = () => {
    // return <SearchForm />
  };

  const renderSortBar = () => {
    // return null;
  };


  const message = () => {
    // return xd黄色のmessage部分
    // props として search coreに流して LegacyPageの時のみこのmessageをSearchPageLayoutの中に差し込む
    // https://xd.adobe.com/view/cd3cb2f8-625d-4a6b-b6e4-917f75c675c5-986f/screen/31308311-63c8-4183-98c9-64ef29811956/
  };

  const onAfterSearchHandler = (keyword, searchedKeyword) => {
    // Do nothing
  };


  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPages={renderActionToPages}
      query="[nq:PrivateLegacyPages]"
    />
  );
};
export default LegacyPage;
