
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

    // const Icons = [
    //   <i className="icon-fw icon-user"></i>,
    //   <i className="icon-fw icon-share-alt"></i>,
    //   <i className="icon-fw icon-lock"></i>,
    //   <i className="icon-fw icon-paper-plane"></i>,
    // ];
    // console.log(`Icons = ${Icons}`);

    // const setIcons = () => {
    //   Icons.map((icon) => {
    //     console.log(icon);
    //     return (
    //       <>
    //         { icon }
    //       </>
    //     );
    //   });
    // };
    // const setIcons = () => {
    //   Icons.map(icon => icon);
    // };

    const setIcon1 = () => {
      return (
        <i className="icon-fw icon-user"></i>
      );
    };
    const setIcon2 = () => {
      return (
        <i className="icon-fw icon-share-alt"></i>
      );
    };
    const setIcon3 = () => {
      return (
        <i className="icon-fw icon-lock"></i>
      );
    };
    const setIcon4 = () => {
      return (
        <i className="icon-fw icon-paper-plan"></i>
      );
    };

    const navTabMapping = {
      user_infomation: {
        Icon: setIcon1,
        Content: UserSettings,
        i18n: t('User Information'),
        index: 0,
      },
      external_accounts: {
        Icon: setIcon2,
        Content: ExternalAccountLinkedMe,
        i18n: t('admin:user_management.external_accounts'),
        index: 1,
      },
      password_settings: {
        Icon: setIcon3,
        Content: PasswordSettings,
        i18n: t('Password Settings'),
        index: 2,
      },
      api_settings: {
        Icon: setIcon4,
        Content: ApiSettings,
        i18n: t('API Settings'),
        index: 3,
      },
    };


    return (
      <>
        <CustomNavigation navTabMapping={navTabMapping} />
      </>
    );
  }

}

PersonalSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(PersonalSettings);
