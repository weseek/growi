import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import BasicInfoSettings from './BasicInfoSettings';
import ProfileImageSettings from './ProfileImageSettings';

type Props = {

};

const UserSettings: FC<Props> = () => {
  const { t } = useTranslation();

  return (
    <div data-testid="grw-user-settings">
      <div className="mb-5">
        <h2 className="border-bottom my-4">{t('Basic Info')}</h2>
        <BasicInfoSettings />
      </div>
      <div className="mb-5">
        <h2 className="border-bottom my-4">{t('Set Profile Image')}</h2>
        <ProfileImageSettings />
      </div>
    </div>
  );
};

export default UserSettings;
