
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BasicInfoSettings from './BasicInfoSettings';
import ProfileImageSettings from './ProfileImageSettings';

class UserSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="mb-5">
          <h2 className="border-bottom my-4">{t('Basic Info')}</h2>
          <BasicInfoSettings />
        </div>
        <div className="mb-5">
          <h2 className="border-bottom my-4">{t('Set Profile Image')}</h2>
          <ProfileImageSettings />
        </div>
      </Fragment>
    );
  }

}


UserSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(UserSettings);
