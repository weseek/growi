import React, { FC, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { V5PageMigrationModal } from './V5PageMigrationModal';
import AdminAppContainer from '../../../client/services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';


const V5PageMigration: FC<any> = (props) => {
  const [isV5PageMigrationModalShown, setIsV5PageMigrationModalShown] = useState(false);
  const { adminAppContainer } = props;
  const { isV5Compatible } = adminAppContainer.state;
  const { t } = useTranslation();

  const onConfirm = async() => {
    await adminAppContainer.startV5PageMigrationHandler();
  };

  return (
    <>
      <V5PageMigrationModal
        isModalOpen={isV5PageMigrationModalShown}
        onConfirm={onConfirm}
        onCancel={() => setIsV5PageMigrationModalShown(false)}
      />
      <p className="card well">
        GROWI is running with v4 compatible pages.<br />
        To use new features such as Page tree or easy renaming, please migrate page schema to v5.<br />
        <br />
        <span className="text-danger">
          <i className="icon-exclamation icon-fw"></i>
          Note: You will lose unique constraint from page path.
        </span>
      </p>
      <div className="row my-3">
        <div className="mx-auto">
          {
            isV5Compatible == null
            && (<button type="button" className="btn btn-secondary mr-3" onClick={() => { /* TODO: POST to set false 80202 */ }}>Not now</button>)
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
