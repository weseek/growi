import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';


class OidcSecurityManagement extends React.Component {

  render() {
    return (
      <p>hoge</p>
    );
  }

}

OidcSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const OidcSecurityManagementWrapper = (props) => {
  return createSubscribedElement(OidcSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminSamlSecurityContainer]);
};

export default withTranslation()(OidcSecurityManagementWrapper);
