
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomNavigation from '../CustomNavigation';
import UserSettings from './UserSettings';
import PasswordSettings from './PasswordSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import ApiSettings from './ApiSettings';

class PersonalSettings extends React.Component {

  render() {
    const { t } = this.props;

    const UserIcon = () => {
      return <i className="icon-fw icon-user"></i>;
    };

    const shereAltIcon = () => {
      return <i className="icon-fw icon-share-alt"></i>;
    };

    const lockIcon = () => {
      return <i className="icon-fw icon-lock"></i>;
    };

    const paperPlaneIcon = () => {
      return <i className="icon-fw icon-paper-plane"></i>;
    };

    const navTabMapping = {
      user_infomation: {
        Icon: UserIcon,
        Content: UserSettings,
        i18n: t('User Information'),
        index: 0,
      },
      external_accounts: {
        Icon: shereAltIcon,
        Content: ExternalAccountLinkedMe,
        i18n: t('admin:user_management.external_accounts'),
        index: 1,
      },
      password_settings: {
        Icon: lockIcon,
        Content: PasswordSettings,
        i18n: t('Password Settings'),
        index: 2,
      },
      api_settings: {
        Icon: paperPlaneIcon,
        Content: ApiSettings,
        i18n: t('API Settings'),
        index: 3,
      },
    };


    return (
      <>
        <h1 className="title">{t('User Settings')}</h1>
        <CustomNavigation navTabMapping={navTabMapping} tabContentClasses={['px-0']} />
      </>
    );
  }

}

PersonalSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(PersonalSettings);
