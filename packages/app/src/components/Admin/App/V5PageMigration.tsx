import React, { FC, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { V5PageMigrationModal } from './V5PageMigrationModal';
import AdminAppContainer from '../../../client/services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../client/util/apiNotification';


const V5PageMigration: FC<any> = (props) => {
  const [isV5PageMigrationModalShown, setIsV5PageMigrationModalShown] = useState(false);
  const { adminAppContainer } = props;
  const { isV5Compatible } = adminAppContainer.state;
  const { t } = useTranslation();

  const onConfirm = async() => {
    setIsV5PageMigrationModalShown(false);
    try {
      await adminAppContainer.v5PageMigrationHandler('upgrade');
      toastSuccess(t('v5_page_migration.successfully_started'));
    }
    catch (err) {
      toastError(err);
    }
  };

  const onNotNowClicked = async() => {
    await adminAppContainer.v5PageMigrationHandler('notNow');
  };

  return (
    <>
      <V5PageMigrationModal
        isModalOpen={isV5PageMigrationModalShown}
        onConfirm={onConfirm}
        onCancel={() => setIsV5PageMigrationModalShown(false)}
      />
      <p className="card well">
        {t('v5_page_migration.migration_desc')}
        <span className="text-danger">
          <i className="icon-exclamation icon-fw"></i>
          {t('v5_page_migration.migration_note')}
        </span>
      </p>
      <div className="row my-3">
        <div className="mx-auto">
          {
            isV5Compatible == null
            && (<button type="button" className="btn btn-secondary mr-3" onClick={() => onNotNowClicked()}>Not now</button>)
          }
          <button type="button" className="btn btn-warning" onClick={() => setIsV5PageMigrationModalShown(true)}>Upgrade to v5</button>
        </div>
      </div>
    </>
  );
};

/**
 * Wrapper component for using unstated
 */
export default withUnstatedContainers(V5PageMigration, [AdminAppContainer]);

V5PageMigration.propTypes = {
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};
