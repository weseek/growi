
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomNavigation from '../CustomNavigation';
import UserSettings from './UserSettings';
import PasswordSettings from './PasswordSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import ApiSettings from './ApiSettings';

import UserIcon from '../Icons/UserIcon';
import ShareAltIcon from '../Icons/ShareAltIcon';
import LockIcon from '../Icons/LooockIcon';
import PaperPlaneIcon from '../Icons/PaperPlaneIcon';

class PersonalSettings extends React.Component {

  render() {
    const { t } = this.props;

    const navTabMapping = {
      user_infomation: {
        Icon: UserIcon,
        Content: UserSettings,
        i18n: t('User Information'),
        index: 0,
      },
      external_accounts: {
        Icon: ShareAltIcon,
        Content: ExternalAccountLinkedMe,
        i18n: t('admin:user_management.external_accounts'),
        index: 1,
      },
      password_settings: {
        Icon: LockIcon,
        Content: PasswordSettings,
        i18n: t('Password Settings'),
        index: 2,
      },
      api_settings: {
        Icon: PaperPlaneIcon,
        Content: ApiSettings,
        i18n: t('API Settings'),
        index: 3,
      },
    };


    return (
      <CustomNavigation navTabMapping={navTabMapping} />
    );
  }

}

PersonalSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(PersonalSettings);
