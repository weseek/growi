import React, {
  FC, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import ActionToSelectedPageGroup from './ActionToSelectedPageGroup';
import PageMigrateModal from './PageMigrateModal';
import SearchCore from './SearchCore';

type Props = {

}

const LegacyPage : FC<Props> = (props: Props) => {

  const { t } = useTranslation();
  const [isActionToPageModalShown, setIsActionToPageModalShown] = useState<boolean>(false);


  // migrate modal
  const renderActionToPageModal = useCallback((pages) => {
    return (
      <PageMigrateModal
        isOpen={isActionToPageModalShown}
        pages={pages}
        onClose={() => { setIsActionToPageModalShown(prev => !prev) }}
      />
    );
  }, [isActionToPageModalShown]);


  const renderActionToPages = useCallback((isSelectAllCheckboxDisabled, selectAllCheckboxType, onClickActionAllButton, onClickSelectAllCheckbox) => {
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
  }, []);

  const alertMessage = (
    <div className="alert alert-warning py-3">
      <h5 className="font-weight-bold mt-1">{t('legacy_pages_alert.legacy_page_alert')}</h5>
      <p>{t('legacy_pages_alert.migrate_help')}</p>
      <p dangerouslySetInnerHTML={{ __html: t('See_more_details_on_new_schema', { url: t('GROWI.5.x_new_schema') }) }} />
    </div>
  );


  const renderLegacyPageControl = useCallback((searchResultCount, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox) => {
    return (
      <div className="position-sticky fixed-top shadow-sm">
        <div className="search-control d-flex align-items-center py-md-2 py-3 px-md-4 px-3 border-bottom border-gray">
          <div className="d-flex pl-md-2">
            {renderActionToPages(searchResultCount === 0, selectAllCheckboxType, actionToAllPagesButtonHandler, toggleAllCheckBox)}
          </div>
        </div>
      </div>
    );
  }, [renderActionToPages]);
  return (
    <SearchCore
      renderControl={renderLegacyPageControl}
      renderActionToPageModal={renderActionToPageModal}
      setIsActionToPageModalShown={setIsActionToPageModalShown}
      query="[nq:PrivateLegacyPages]"
      alertMessage={alertMessage}
      excludeUserPages={false}
      excludeTrashPages={false}
    />
  );
};
export default LegacyPage;
