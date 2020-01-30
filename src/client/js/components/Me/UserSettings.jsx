
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BasicInfoSettings from './BasicInfoSettings';

class UserSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="mb-5 container-fluid">
          <h2 className="border-bottom">{t('Basic Info')}</h2>
          <BasicInfoSettings />
        </div>

        <div className="mb-5 container-fluid">
          <h2 className="border-bottom">{t('Set Profile Image')}</h2>
          {/* TODO GW-1032 create component */}
        </div>

      </Fragment>
    );
  }

}


UserSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(UserSettings);
