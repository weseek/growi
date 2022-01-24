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
    return <SearchPageForm keyword={keyword} appContainer={appContainer} onSearchFormChanged={onSearchInvoked}></SearchPageForm>;
  };

  // TODO : i18n
  // TASK : https://redmine.weseek.co.jp/issues/86488
  const alertMessage = (
    <div className="alert alert-warning py-3">
      <h5 className="font-weight-bold mt-1">旧形式のプライペートページです</h5>
      <p>
        チェックボックスでページを選択して 画面上部新スキーマへ変換する ボタンから新スキーマへ切り替えることが可能です。
        詳しくは<a href="#" className="alert-link"> GROWI.4.9における新スキーマについて<i className="icon-share-alt"></i> </a>を参照ください。
      </p>
    </div>
  );

  return (
    <SearchCore
      renderActionToPagesModal={renderActionsToPageModal}
      renderActionToPages={renderActionToPages}
      renderSearchForm={renderSearchForm}
      query="[nq:PrivateLegacyPages]"
      shouldExcludeUserPages={false}
      shouldExcludeTrashPages={false}
      alertMessage={alertMessage}
    />
  );
};
export default LegacyPage;
