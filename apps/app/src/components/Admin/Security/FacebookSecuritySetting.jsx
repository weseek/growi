import React from 'react';

import { withTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';


class FacebookSecurityManagement extends React.Component {

  render() {
    const { t } = this.props;
    return (
      <>
        <h2 className="alert-anchor border-bottom">
          Facebook OAuth { t('admin:security_settings.configuration') }
        </h2>

        <p className="well">(TBD)</p>
      </>
    );
  }

}


FacebookSecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const FacebookSecurityManagementWrapper = withUnstatedContainers(FacebookSecurityManagement, [AdminGeneralSecurityContainer]);

export default withTranslation()(FacebookSecurityManagementWrapper);
