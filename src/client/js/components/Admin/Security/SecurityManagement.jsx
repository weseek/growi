import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { toastError } from '../../../util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import SecurityManagementContents from './SecurityManagementContents';

let retrieveErrors = null;
function SecurityManagement(props) {
  const { adminGeneralSecurityContainer } = props;

  if (adminGeneralSecurityContainer.state.currentRestrictGuestMode === adminGeneralSecurityContainer.dummyCurrentRestrictGuestMode) {
    throw (async() => {
      try {
        await adminGeneralSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminGeneralSecurityContainer.setState({
          currentRestrictGuestMode: adminGeneralSecurityContainer.dummyCurrentRestrictGuestModeForError,
        });
      }
    })();
  }

  if (adminGeneralSecurityContainer.state.currentRestrictGuestMode === adminGeneralSecurityContainer.dummyCurrentRestrictGuestModeForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <SecurityManagementContents />;
}

SecurityManagement.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const SecurityManagementWithUnstatedContainer = withUnstatedContainers(SecurityManagement, [AdminGeneralSecurityContainer]);

function SecurityManagementWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <SecurityManagementWithUnstatedContainer {...props} />
    </Suspense>
  );
}

export default SecurityManagementWithContainerWithSuspense;
