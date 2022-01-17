import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
// 1. renderSearchForm
// 2. icon migrate
// 3. onAfterSearchInvoked should be refactored in LegacyPage
const LegacyPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  // TODO
  // Task : https://redmine.weseek.co.jp/issues/85465
  const actionIconAndText = (
    <>
      <i className=""></i>
      migrate
    </>
  );

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

  const renderSearchForm = () => {
    // TODO
    // Task : https://redmine.weseek.co.jp/issues/85465
    // return <SearchForm disabled>;
  };


  const onAfterSearchHandler = (keyword, searchedKeyword) => {
    // TODO
    // Task : https://redmine.weseek.co.jp/issues/85465
  };


  return (
    <SearchCore
      onAfterSearchInvoked={onAfterSearchHandler}
      renderActionToPagesModal={renderActionsToPageModal}
      actionIconAndText={actionIconAndText}
    />
  );
};
export default LegacyPage;
