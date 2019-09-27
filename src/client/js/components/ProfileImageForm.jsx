import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import { createSubscribedElement } from './UnstatedUtils';

class ProfileImageForm extends React.Component {

  render() {
    const t = this.props.t;

    return (
      <div>
        <div className="form-group col-md-2 col-sm-offset-1 col-sm-4">
          <h4>
            <div className="radio radio-primary">
              <input type="radio" id="radioGravatar" form="formImageType" name="imagetypeForm[isGravatarEnabled]" value="true" />
              <label htmlFor="radioGravatar">
                <img src="https://gravatar.com/avatar/00000000000000000000000000000000?s=24" /> Gravatar
              </label>
              <a href="https://gravatar.com/">
                <small><i className="icon-arrow-right-circle" aria-hidden="true"></i></small>
              </a>
            </div>
          </h4>

          <img src="{{ user|gravatar }}" width="64" />
        </div>

        <div className="form-group col-md-4 col-sm-7">
          <h4>
            <div className="radio radio-primary">
              <input type="radio" id="radioUploadPicture" form="formImageType" name="imagetypeForm[isGravatarEnabled]" value="false" />
              <label htmlFor="radioUploadPicture">
                { t('Upload Image') }
              </label>
            </div>
          </h4>
          <div className="form-group">
            <div id="pictureUploadFormMessage"></div>
            <label htmlFor="" className="col-sm-4 control-label">
              { t('Current Image') }
            </label>
            <div className="col-sm-8">
              <p>
                <img src="{{ user|uploadedpicture }}" className="picture picture-lg img-circle" id="settingUserPicture" /><br />
              </p>
              <p>
                <form
                  id="remove-attachment"
                  action="/_api/attachments.removeProfileImage"
                  method="post"
                  className="form-horizontal"
                >
                  <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                  <button type="submit" className="btn btn-danger">{ t('Delete Image') }</button>
                </form>
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="" className="col-sm-4 control-label">
              { t('Upload new image') }
            </label>
            <div className="col-sm-8">
              {/* {% if fileUploadService.getIsUploadable() %}
              <form action="/_api/attachments.uploadProfileImage" id="pictureUploadForm" method="post" class="form-horizontal" role="form">
                <input type="hidden" name="_csrf" value="{{ csrf() }}">
                <input type="file" name="profileImage" accept="image/*">
                <div id="pictureUploadFormProgress" class="d-flex align-items-center">
                </div>
              </form>
              {% else %} */}
              {/* * { t('page_me.form_help.profile_image1') }<br>
              * { t('page_me.form_help.profile_image2') }<br> */}
              {/* {% endif %} */}
            </div>
          </div>

        </div>

        <div className="form-group">
          <div className="col-sm-offset-4 col-sm-6">
            <button type="submit" form="formImageType" className="btn btn-primary">{ t('Update') }</button>
          </div>
        </div>
      </div>
    );
  }

}
/**
 * Wrapper component for using unstated
 */
const ProfileImageFormWrapper = (props) => {
  return createSubscribedElement(ProfileImageForm, props, [AppContainer]);
};

ProfileImageForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ProfileImageFormWrapper);
