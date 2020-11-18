
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';
import UserSettings from './UserSettings';
import PasswordSettings from './PasswordSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import ApiSettings from './ApiSettings';

const PersonalSettings = (props) => {

  const { t } = props;

  const navTabMapping = useMemo(() => {
    return {
      user_infomation: {
        Icon: () => <i className="icon-fw icon-user"></i>,
        Content: UserSettings,
        i18n: t('User Information'),
        index: 0,
      },
      external_accounts: {
        Icon: () => <i className="icon-fw icon-share-alt"></i>,
        Content: ExternalAccountLinkedMe,
        i18n: t('admin:user_management.external_accounts'),
        index: 1,
      },
      password_settings: {
        Icon: () => <i className="icon-fw icon-lock"></i>,
        Content: PasswordSettings,
        i18n: t('Password Settings'),
        index: 2,
      },
      api_settings: {
        Icon: () => <i className="icon-fw icon-paper-plane"></i>,
        Content: ApiSettings,
        i18n: t('API Settings'),
        index: 3,
      },
    };
  }, [t]);


  return (
    <CustomNavAndContents navTabMapping={navTabMapping} navigationMode="both" tabContentClasses={['px-0']} />
  );

};

PersonalSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(PersonalSettings);
