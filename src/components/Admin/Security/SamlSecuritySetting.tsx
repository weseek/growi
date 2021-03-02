/* eslint-disable react/no-danger */
import React, { FC } from 'react';
// import PropTypes from 'prop-types';

// import { toastError } from '~/client/js/util/apiNotification';

// import AdminSamlSecurityContainer from '~/client/js/services/AdminSamlSecurityContainer';
// import { toArrayIfNot } from '~/utils/array-utils';
// import { withLoadingSppiner } from '~/client/js/components/SuspenseUtils;
import { useSiteUrl } from '../../../stores/context';

import SamlSecuritySettingContents from '~/client/js/components/Admin/Security/SamlSecuritySettingContents';

type Props = {
  // adminSamlSecurityContainer: AdminSamlSecurityContainer,
  siteUrl: string,
}

// const retrieveErrors = null;
export const SamlSecurityManagement: FC<Props> = (props: Props) => {
  const { data } = useSiteUrl(props.siteUrl);
  // const { adminSamlSecurityContainer } = props;
  // if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPoint) {
  //   throw (async() => {
  //     try {
  //       await adminSamlSecurityContainer.retrieveSecurityData();
  //     }
  //     catch (err) {
  //       const errs = toArrayIfNot(err);
  //       toastError(errs);
  //       // retrieveErrors = errs;
  //       adminSamlSecurityContainer.setState({ samlEntryPoint: adminSamlSecurityContainer.dummySamlEntryPointForError });
  //     }
  //   })();
  // }

  // if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPointForError) {
  //   throw new Error(`${retrieveErrors.length} errors occured`);
  // }

  return <SamlSecuritySettingContents siteUrl={data} />;
};


// SamlSecurityManagement.propTypes = {
//   adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
// };

// function SamlSecurityManagement(props) {
//   const { adminSamlSecurityContainer } = props;
//   if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPoint) {
//     throw (async() => {
//       try {
//         await adminSamlSecurityContainer.retrieveSecurityData();
//       }
//       catch (err) {
//         const errs = toArrayIfNot(err);
//         toastError(errs);
//         // retrieveErrors = errs;
//         adminSamlSecurityContainer.setState({ samlEntryPoint: adminSamlSecurityContainer.dummySamlEntryPointForError });
//       }
//     })();
//   }

//   // if (adminSamlSecurityContainer.state.samlEntryPoint === adminSamlSecurityContainer.dummySamlEntryPointForError) {
//   //   throw new Error(`${retrieveErrors.length} errors occured`);
//   // }

//   return <SamlSecuritySettingContents />;
// }

// const SamlSecurityManagementWithUnstatedContainer = withUnstatedContainers(SamlSecurityManagement, [
//   AdminSamlSecurityContainer,
// ]);

// export default SamlSecurityManagementWithUnstatedContainer;
