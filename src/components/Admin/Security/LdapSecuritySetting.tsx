import React, { FC } from 'react';

// import { toastError } from '~/client/js/util/apiNotification';
// import { toArrayIfNot } from '~/utils/array-utils';
// import { withLoadingSppiner } from '~/client/js/components/SuspenseUtils';

// import AdminLdapSecurityContainer from '~/client/js/services/AdminLdapSecurityContainer';

import LdapSecuritySettingContents from '~/client/js/components/Admin/Security/LdapSecuritySettingContents';

const retrieveErrors = null;
export const LdapSecuritySetting: FC = () => {

  // TODO: improve following error handling by GW 5196

  // const { adminLdapSecurityContainer } = props;
  // if (adminLdapSecurityContainer.state.serverUrl === adminLdapSecurityContainer.dummyServerUrl) {
  //   throw (async() => {
  //     try {
  //       await adminLdapSecurityContainer.retrieveSecurityData();
  //     }
  //     catch (err) {
  //       const errs = toArrayIfNot(err);
  //       toastError(errs);
  //       retrieveErrors = errs;
  //       adminLdapSecurityContainer.setState({ serverUrl: adminLdapSecurityContainer.dummyServerUrlForError });
  //     }
  //   })();
  // }

  // if (adminLdapSecurityContainer.state.serverUrl === adminLdapSecurityContainer.dummyServerUrlForError) {
  //   throw new Error(`${retrieveErrors.length} errors occured`);
  // }

  return <LdapSecuritySettingContents />;
};


/*
  Original codes
*/

// import React from 'react';
// import PropTypes from 'prop-types';

// import { withUnstatedContainers } from '~/client/js/components/UnstatedUtils';
// import { toastError } from '~/client/js/util/apiNotification';
// import { toArrayIfNot } from '~/utils/array-utils';
// import { withLoadingSppiner } from '~/client/js/components/SuspenseUtils';

// import AdminLdapSecurityContainer from '~/client/js/services/AdminLdapSecurityContainer';

// import LdapSecuritySettingContents from '~/client/js/components/Admin/Security/LdapSecuritySettingContents';

// const retrieveErrors = null;
// function LdapSecuritySetting(props) {
// const { adminLdapSecurityContainer } = props;
// if (adminLdapSecurityContainer.state.serverUrl === adminLdapSecurityContainer.dummyServerUrl) {
//   throw (async() => {
//     try {
//       await adminLdapSecurityContainer.retrieveSecurityData();
//     }
//     catch (err) {
//       const errs = toArrayIfNot(err);
//       toastError(errs);
//       retrieveErrors = errs;
//       adminLdapSecurityContainer.setState({ serverUrl: adminLdapSecurityContainer.dummyServerUrlForError });
//     }
//   })();
// }

// if (adminLdapSecurityContainer.state.serverUrl === adminLdapSecurityContainer.dummyServerUrlForError) {
//   throw new Error(`${retrieveErrors.length} errors occured`);
// }

//   return <LdapSecuritySettingContents />;
// }

// LdapSecuritySetting.propTypes = {
//   adminLdapSecurityContainer: PropTypes.instanceOf(AdminLdapSecurityContainer).isRequired,
// };

// const LdapSecuritySettingWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(LdapSecuritySetting), [
//   AdminLdapSecurityContainer,
// ]);

// export default LdapSecuritySettingWithUnstatedContainer;
