import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class GrowiImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.inputRef = React.createRef();

    this.changeFileName = this.changeFileName.bind(this);
    this.import = this.import.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  changeFileName(e) {
    // to rerender onChange
    // eslint-disable-next-line react/no-unused-state
    this.setState({ name: e.target.files[0].name });
  }

  async import(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_csrf', this.props.appContainer.csrfToken);
    formData.append('file', this.inputRef.current.files[0]);

    // TODO use appContainer.apiv3.post
    await this.props.appContainer.apiPost('/v3/import/pages', formData);
    // TODO toastSuccess, toastError
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
      <form className="form-horizontal" onSubmit={this.import}>
        <fieldset>
          <legend>Import</legend>
          <div className="well well-sm small">
            <ul>
              <li>Imported pages will overwrite existing pages</li>
            </ul>
          </div>
          <div className="form-group d-flex align-items-center">
            <label htmlFor="file" className="col-xs-3 control-label">Zip File</label>
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
                { t('importer_management.import') }
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }

}

GrowiImportForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiImportFormWrapper = (props) => {
  return createSubscribedElement(GrowiImportForm, props, [AppContainer]);
};

export default withTranslation()(GrowiImportFormWrapper);
