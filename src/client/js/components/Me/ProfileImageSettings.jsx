import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

class ProfileImageSettings extends React.Component {

  constructor(appContainer) {
    super();

  }


  render() {
    const { t, personalContainer } = this.props;

    return (
      <div className="row">
        <div className="col-md-2 col-sm-offset-1 col-sm-4">
          <h4>
            <div className="radio radio-primary">
              <input
                type="radio"
                id="radioGravatar"
                form="formImageType"
                name="imagetypeForm[isGravatarEnabled]"
                checked={personalContainer.state.isGravatarEnabled}
                onChange={() => { personalContainer.changeIsGravatarEnabled(true) }}
              />
              <label htmlFor="radioGravatar">
                <img src="https://gravatar.com/avatar/00000000000000000000000000000000?s=24" /> Gravatar
              </label>
              <a href="https://gravatar.com/">
                <small><i className="icon-arrow-right-circle" aria-hidden="true"></i></small>
              </a>
            </div>
          </h4>

          {/* TODO set gravator src */}
          <img src="" width="64" />
        </div>

        <div className="col-md-4 col-sm-7">
          <h4>
            <div className="radio radio-primary">
              <input
                type="radio"
                id="radioUploadPicture"
                form="formImageType"
                name="imagetypeForm[isGravatarEnabled]"
                checked={!personalContainer.state.isGravatarEnabled}
                onChange={() => { personalContainer.changeIsGravatarEnabled(false) }}
              />
              <label htmlFor="radioUploadPicture">
                { t('Upload Image') }
              </label>
            </div>
          </h4>
        </div>
      </div>
    );
  }

}


const ProfileImageSettingsWrapper = (props) => {
  return createSubscribedElement(ProfileImageSettings, props, [AppContainer, PersonalContainer]);
};

ProfileImageSettings.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ProfileImageSettingsWrapper);
