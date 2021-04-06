import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminMikanSecurityContainer from '../../../services/AdminMikanSecurityContainer';

import MikanSecuritySettingContents from './MikanSecuritySettingContents';

let retrieveErrors = null;
function MikanSecuritySetting(props) {
  const { adminMikanSecurityContainer } = props;
  if (adminMikanSecurityContainer.state.apiUrl === adminMikanSecurityContainer.dummyApiUrl) {
    throw (async() => {
      try {
        await adminMikanSecurityContainer.retrieveSecurityData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        retrieveErrors = errs;
        adminMikanSecurityContainer.setState({ serverUrl: adminMikanSecurityContainer.dummyApiUrlForError });
      }
    })();
  }

  if (adminMikanSecurityContainer.state.apiUrl === adminMikanSecurityContainer.dummyApiUrlForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <MikanSecuritySettingContents />;
}

MikanSecuritySetting.propTypes = {
  adminMikanSecurityContainer: PropTypes.instanceOf(AdminMikanSecurityContainer).isRequired,
};

const MikanSecuritySettingWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(MikanSecuritySetting), [
  AdminMikanSecurityContainer,
]);

export default MikanSecuritySettingWithUnstatedContainer;
