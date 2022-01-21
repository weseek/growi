import React, {
  FC,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';
import SearchPageForm from './SearchPage/SearchPageForm';

type Props = {

}

// TODO
// Task : https://redmine.weseek.co.jp/issues/85465
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

  const renderSearchForm = (keyword, appContainer, onSearchInvoked) => {
    return <SearchPageForm keyword={keyword} appContainer={appContainer} onSearchFormChanged={onSearchInvoked} isDisabled></SearchPageForm>;
  };


  const message = () => {
    // return xd黄色のmessage部分
    // props として search coreに流して LegacyPageの時のみこのmessageをSearchPageLayoutの中に差し込む
    // https://xd.adobe.com/view/cd3cb2f8-625d-4a6b-b6e4-917f75c675c5-986f/screen/31308311-63c8-4183-98c9-64ef29811956/
  };

  return (
    <SearchCore
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPages={renderActionToPages}
      renderSearchForm={renderSearchForm}
      query="[nq:PrivateLegacyPages]"
      shouldExcludeUserPages={false}
      shouldExcludeTrashPages={false}
    />
  );
};
export default LegacyPage;
