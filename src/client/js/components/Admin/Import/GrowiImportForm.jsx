import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class GrowiImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      meta: {},
      zipFileName: '',
      collections: new Set(),
      fileStats: [],
      schema: {
        pages: {},
        revisions: {},
      },
    };

    this.state = this.initialState;

    this.inputRef = React.createRef();

    this.changeFileName = this.changeFileName.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.uploadZipFile = this.uploadZipFile.bind(this);
    this.import = this.import.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  changeFileName(e) {
    // to rerender onChange
    // eslint-disable-next-line react/no-unused-state
    this.setState({ name: e.target.files[0].name });
  }

  toggleCheckbox(e) {
    const { target } = e;
    const { name, checked } = target;

    this.setState((prevState) => {
      const collections = new Set(prevState.collections);
      if (checked) {
        collections.add(name);
      }
      else {
        collections.delete(name);
      }
      return { collections };
    });
  }

  async uploadZipFile(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_csrf', this.props.appContainer.csrfToken);
    formData.append('file', this.inputRef.current.files[0]);

    // TODO use appContainer.apiv3.post
    const { data } = await this.props.appContainer.apiPost('/v3/import/upload', formData);
    this.setState({ meta: data.meta, zipFileName: data.fileName, fileStats: data.fileStats });
    // TODO toastSuccess, toastError
  }

  async import(e) {
    e.preventDefault();

    // TODO use appContainer.apiv3.post
    await this.props.appContainer.apiPost('/v3/import', {
      fileName: this.state.zipFileName,
      collections: Array.from(this.state.collections),
      schema: this.state.schema,
    });
    // TODO toastSuccess, toastError
    this.setState(this.initialState);
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
      <Fragment>
        <form className="form-horizontal" onSubmit={this.uploadZipFile}>
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
                  Upload
                </button>
              </div>
            </div>
          </fieldset>
        </form>

        {/* TODO: move to another component 1 */}
        {this.state.fileStats.length > 0 && (
          <Fragment>
            {/* TODO: move to another component 2 */}
            <div>{this.state.zipFileName}</div>
            <div>{JSON.stringify(this.state.meta)}</div>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th></th>
                  <th>File</th>
                  <th>Collection</th>
                </tr>
              </thead>
              <tbody>
                {this.state.fileStats.map((file) => {
                  const { fileName, collectionName } = file;
                  return (
                    <tr key={fileName}>
                      <td>
                        <input
                          type="checkbox"
                          id={collectionName}
                          name={collectionName}
                          className="form-check-input"
                          value={collectionName}
                          checked={this.state.collections.has(collectionName)}
                          onChange={this.toggleCheckbox}
                        />
                      </td>
                      <td>{fileName}</td>
                      <td>{collectionName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* TODO: move to another component 3 */}
            <button type="submit" className="btn btn-primary" onClick={this.import}>
              { t('importer_management.import') }
            </button>
          </Fragment>
        )}
      </Fragment>
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
