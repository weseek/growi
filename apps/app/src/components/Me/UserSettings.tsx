import React from 'react';

import { useTranslation } from 'next-i18next';

import { BasicInfoSettings } from './BasicInfoSettings';
import ProfileImageSettings from './ProfileImageSettings';

const UserSettings = React.memo((): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div data-testid="grw-user-settings">
      <div className="mb-5">
        <h4 className="border-bottom mt-4 mb-3 mb-md-5 pb-1">{t('Basic Info')}</h4>
        <BasicInfoSettings />
      </div>
      <div className="mb-5">
        <h4 className="border-bottom mt-4 mb-5 pb-1">{t('Set Profile Image')}</h4>
        <ProfileImageSettings />
      </div>
    </div>
  );
});
UserSettings.displayName = 'UserSettings';

export default UserSettings;
