import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import md5 from 'md5';

import { toastSuccess, toastError } from '../../util/apiNotification';
import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';

class ProfileImageSettings extends React.Component {

  constructor(appContainer) {
    super();

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, personalContainer } = this.props;

    try {
      await personalContainer.updateProfileImage();
      toastSuccess(t('toaster.update_successed', { target: t('Set Profile Image') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  generateGravatarSrc() {
    const email = this.props.personalContainer.state.email || '';
    const hash = md5(email.trim().toLowerCase());
    return `https://gravatar.com/avatar/${hash}`;
  }

  render() {
    const { t, personalContainer } = this.props;

    return (
      <React.Fragment>
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

            <img src={this.generateGravatarSrc()} width="64" />
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
            <div className="form-group">
              <div id="pictureUploadFormMessage"></div>
              <label className="col-sm-4 control-label">
                { t('Current Image') }
              </label>
              {/* TDOO GW-1198 uproad profile image */}
            </div>
          </div>
        </div>

        <div className="row my-3">
          <div className="col-xs-offset-4 col-xs-5">
            <button type="button" className="btn btn-primary" onClick={this.onClickSubmit} disabled={personalContainer.state.retrieveError != null}>
              {t('Update')}
            </button>
          </div>
        </div>

      </React.Fragment>
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
