import React, {
  FC, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';

type Props = {

}

const LegacyPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();

  const [excludeUserPages, setExcludeUserPages] = useState<boolean>(false);
  const [excludeTrashPages, setExcludeTrashPages] = useState<boolean>(false);

  // migrate modal
  const renderActionToPageModal = (isActionConfirmModalShown, getSelectedPagesForAction, closeActionConfirmModalHandler) => {
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
        {t('modal_migrate.migrating_page')}
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


  const alertMessage = (
    <div className="alert alert-warning py-3">
      <h5 className="font-weight-bold mt-1">{t('legacy_pages_alert.legacy_page_alert')}</h5>
      <p>{t('legacy_pages_alert.migrate_help')}</p>
      <p dangerouslySetInnerHTML={{ __html: t('See_more_detail_on_new_schema', { url: t('GROWI.5.0_new_schema') }) }} />
    </div>
  );

  return (
    <SearchCore
      renderActionToPagesModal={renderActionToPageModal}
      renderActionToPages={renderActionToPages}
      query="[nq:PrivateLegacyPages]"
      alertMessage={alertMessage}
      excludeUserPages={excludeUserPages}
      excludeTrashPages={excludeTrashPages}
    />
  );
};
export default LegacyPage;
