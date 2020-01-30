
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

class BasicInfoSettings extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="form-group">
          <label htmlFor="userForm[name]" className="col-sm-2 control-label">{ t('Name') }</label>
          <div className="col-sm-4">
            <input className="form-control" type="text" name="userForm[name]" value="{{ user.name }}" required />
          </div>
        </div>
      </Fragment>
    );
  }

}

const BasicInfoSettingsWrapper = (props) => {
  return createSubscribedElement(BasicInfoSettings, props, [AppContainer, PersonalContainer]);
};

BasicInfoSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(BasicInfoSettingsWrapper);
