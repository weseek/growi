import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';
import AdminSamlSecurityContainer from '../../../services/AdminSamlSecurityContainer';


class SamlSecurityManagement extends React.Component {

  render() {
    return <p>{this.props.adminSamlSecurityContainer.state.hoge}</p>;
  }

}

SamlSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  AdminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  adminSamlSecurityContainer: PropTypes.instanceOf(AdminSamlSecurityContainer).isRequired,
};

const SamlSecurityManagementWrapper = (props) => {
  return createSubscribedElement(SamlSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer, AdminSamlSecurityContainer]);
};

export default withTranslation()(SamlSecurityManagementWrapper);
