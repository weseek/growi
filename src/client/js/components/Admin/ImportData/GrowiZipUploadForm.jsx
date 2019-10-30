import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class GrowiZipUploadForm extends React.Component {

  constructor(props) {
    super(props);

    this.inputRef = React.createRef();

    this.changeFileName = this.changeFileName.bind(this);
    this.uploadZipFile = this.uploadZipFile.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  changeFileName(e) {
    // to trigger rerender at onChange event
    // eslint-disable-next-line react/no-unused-state
    this.setState({ dummy: e.target.files[0].name });
  }

  async uploadZipFile(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_csrf', this.props.appContainer.csrfToken);
    formData.append('file', this.inputRef.current.files[0]);

    // TODO: use appContainer.apiv3.post
    const { data } = await this.props.appContainer.apiPost('/v3/import/upload', formData);
    this.props.onUpload(data);
    // TODO: toastSuccess, toastError
  }

  validateForm() {
    return (
      this.inputRef.current // null check
      && this.inputRef.current.files[0] // null check
      && /\.zip$/.test(this.inputRef.current.files[0].name) // validate extension
    );
  }

  render() {
    const { t } = this.props;

    return (
      <form className="form-horizontal" onSubmit={this.uploadZipFile}>
        <fieldset>
          <div className="form-group">
            <label htmlFor="file" className="col-xs-3 control-label">{t('importer_management.growi_settings.zip_file')}</label>
            <div className="col-xs-6">
              <input
                type="file"
                name="file"
                className="form-control-file"
                ref={this.inputRef}
                onChange={this.changeFileName}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-xs-offset-3 col-xs-6">
              <button type="submit" className="btn btn-primary" disabled={!this.validateForm()}>
                {t('importer_management.growi_settings.upload')}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }

}

GrowiZipUploadForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onUpload: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiZipUploadFormWrapper = (props) => {
  return createSubscribedElement(GrowiZipUploadForm, props, [AppContainer]);
};

export default withTranslation()(GrowiZipUploadFormWrapper);
