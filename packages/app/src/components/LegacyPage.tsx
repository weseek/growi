import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';
import ActionToPageGroup from './SearchPage/ActionToPageGroup';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. renderSearchForm
// 2. icon migrate
// 3. onAfterSearchInvoked should be refactored in LegacyPage
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

  const renderActionToPageGroup = (isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionButton, onClickSelectAllCheckbox) => {
    // TODO
    // Task : https://redmine.weseek.co.jp/issues/85465
    const actionTypeAndText = (
      <>
        <i className=""></i>
        migrate
      </>
    );
    return (
      <ActionToPageGroup
        actionTypeIconAndText={actionTypeAndText}
        isSelectAllCheckboxDisabled={isSelectAllCheckboxDisabled}
        selectAllCheckboxType={selectAllCheckboxType}
        onClickActionButton={onClickActionButton}
        onClickSelectAllCheckbox={onClickSelectAllCheckbox}
      >
      </ActionToPageGroup>
    );
  };

  const renderSearchForm = () => {
    // TODO
    // Task : https://redmine.weseek.co.jp/issues/85465
    // return <SearchForm disabled>;
  };


  const onAfterSearchHandler = (keyword, searchedKeyword) => {
  };


  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPageGroup={renderActionToPageGroup}
    />
  );
};
export default LegacyPage;
