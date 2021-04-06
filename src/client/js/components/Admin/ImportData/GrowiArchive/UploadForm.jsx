import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../../UnstatedUtils';
import AppContainer from '../../../../services/AppContainer';
import { toastError } from '../../../../util/apiNotification';

class UploadForm extends React.Component {

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

    try {
      const { data } = await this.props.appContainer.apiv3Post('/import/upload', formData);
      // TODO: toastSuccess, toastError
      this.props.onUpload(data);
    }
    catch (err) {
      if (err[0].code === 'versions-are-not-met') {
        if (this.props.onVersionMismatch !== null) {
          this.props.onVersionMismatch(err[0].code);
        }
      }
      else {
        toastError(err);
      }
    }
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
      <form onSubmit={this.uploadZipFile}>
        <fieldset>
          <div className="form-group row">
            <label htmlFor="file" className="col-md-3 col-form-label col-form-label-sm">
              {t('admin:importer_management.growi_settings.growi_archive_file')}
            </label>
            <div className="col-md-6">
              <input
                type="file"
                name="file"
                className="form-control-file"
                accept=".zip"
                ref={this.inputRef}
                onChange={this.changeFileName}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="mx-auto">
              <button type="submit" className="btn btn-primary" disabled={!this.validateForm()}>
                {t('admin:importer_management.growi_settings.upload')}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }

}

UploadForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onUpload: PropTypes.func.isRequired,
  isTheSameVersion: PropTypes.bool,
  onVersionMismatch: PropTypes.func,
};

/**
 * Wrapper component for using unstated
 */
const UploadFormWrapper = withUnstatedContainers(UploadForm, [AppContainer]);

export default withTranslation()(UploadFormWrapper);
