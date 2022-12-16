
import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';

import ApiSettings from './ApiSettings';
import { EditorSettings } from './EditorSettings';
import ExternalAccountLinkedMe from './ExternalAccountLinkedMe';
import InAppNotificationSettings from './InAppNotificationSettings';
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
      editor_settings: {
        Icon: () => <i className="icon-fw icon-pencil"></i>,
        Content: EditorSettings,
        i18n: t('editor_settings.editor_settings'),
        index: 4,
      },
      in_app_notification_settings: {
        Icon: () => <i className="icon-fw icon-bell"></i>,
        Content: InAppNotificationSettings,
        i18n: t('in_app_notification_settings.in_app_notification_settings'),
        index: 5,
      },
    };
  }, [t]);

  const onPasswordSettings = window.location.hash === '#password';

  return (
    <div data-testid="grw-personal-settings">
      <CustomNavAndContents defaultTabIndex={onPasswordSettings && 2} navTabMapping={navTabMapping} navigationMode="both" tabContentClasses={['px-0']} />
    </div>
  );

};

export default PersonalSettings;
