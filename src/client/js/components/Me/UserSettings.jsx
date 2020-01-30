
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class UserSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="mb-5 container-fluid">
          <h2 className="border-bottom">{t('Basic Info')}</h2>
        </div>

      </Fragment>
    );
  }

}

const UserSettingsWrapper = (props) => {
  return createSubscribedElement(UserSettings, props, [AppContainer]);
};

UserSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(UserSettingsWrapper);
