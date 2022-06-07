
import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import BasicInfoSettings from './BasicInfoSettings';
import ProfileImageSettings from './ProfileImageSettings';

class UserSettings extends React.Component {

  render() {
    const { t } = this.props;

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
  }

}

UserSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

const UserSettingsWrapperFC = (props) => {
  const { t } = useTranslation();
  return <UserSettings t={t} {...props} />;
};

export default UserSettingsWrapperFC;
