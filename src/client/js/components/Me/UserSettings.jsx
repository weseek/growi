
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
        <div className="container-fluid my-4">
          <h2 className="border-bottom">{t('Basic Info')}</h2>
        </div>
        <BasicInfoSettings />

        <div className="container-fluid my-4">
          <h2 className="border-bottom">{t('Set Profile Image')}</h2>
        </div>
        <ProfileImageSettings />

      </Fragment>
    );
  }

}


UserSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(UserSettings);
