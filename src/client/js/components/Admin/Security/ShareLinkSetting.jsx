import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class ShareLinkSetting extends React.Component {

  render() {
    return (
      <div>
        Here is ShareLinkSetting.
      </div>
    );
  }

}

ShareLinkSetting.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const ShareLinkSettingWrapper = (props) => {
  return createSubscribedElement(ShareLinkSetting, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(ShareLinkSettingWrapper);
