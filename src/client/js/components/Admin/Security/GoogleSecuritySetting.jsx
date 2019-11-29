/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class GoogleSecurityManagement extends React.Component {

  render() {
    return (
      <p>google</p>
    );
  }

}


GoogleSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const GoogleSecurityManagementWrapper = (props) => {
  return createSubscribedElement(GoogleSecurityManagement, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(GoogleSecurityManagementWrapper);
