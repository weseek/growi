
import React, { useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';

import ApiSettings from './ApiSettings';
// import { EditorSettings } from './EditorSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import InAppNotificationSettings from './InAppNotificationSettings';
import OtherSettings from './OtherSettings';
import PasswordSettings from './PasswordSettings';
import UserSettings from './UserSettings';

const PersonalSettings = () => {

  const { t } = useTranslation();

  const navTabMapping = useMemo(() => {
    return {
      user_infomation: {
        Icon: () => <i className="icon-fw icon-user"></i>,
        Content: UserSettings,
        i18n: t('User Information'),
      },
      external_accounts: {
        Icon: () => <i className="icon-fw icon-share-alt"></i>,
        Content: ExternalAccountLinkedMe,
        i18n: t('admin:user_management.external_accounts'),
      },
      password_settings: {
        Icon: () => <i className="icon-fw icon-lock"></i>,
        Content: PasswordSettings,
        i18n: t('Password Settings'),
      },
      api_settings: {
        Icon: () => <i className="icon-fw icon-paper-plane"></i>,
        Content: ApiSettings,
        i18n: t('API Settings'),
      },
      // editor_settings: {
      //   Icon: () => <i className="icon-fw icon-pencil"></i>,
      //   Content: EditorSettings,
      //   i18n: t('editor_settings.editor_settings'),
      // },
      in_app_notification_settings: {
        Icon: () => <i className="icon-fw icon-bell"></i>,
        Content: InAppNotificationSettings,
        i18n: t('in_app_notification_settings.in_app_notification_settings'),
      },
      other_settings: {
        Icon: () => <i className="icon-fw icon-settings"></i>,
        Content: OtherSettings,
        i18n: t('Other Settings'),
        index: 6,
      },
    };
  }, [t]);

  const getDefaultTabIndex = () => {
    // e.g) '/me#password_settings' sets password settings tab as default
    const tab = window.location.hash?.substring(1);
    return navTabMapping[tab]?.index;
  };

  return (
    <div data-testid="grw-personal-settings">
      <CustomNavAndContents defaultTabIndex={getDefaultTabIndex()} navTabMapping={navTabMapping} navigationMode="both" tabContentClasses={['px-0']} />
    </div>
  );

};

export default PersonalSettings;
