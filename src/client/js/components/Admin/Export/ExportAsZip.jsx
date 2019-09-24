import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportAsZip extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      zipFileStats: [],
      collections: new Set(),
    };

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.export = this.export.bind(this);
    this.deleteZipFile = this.deleteZipFile.bind(this);
  }

  async componentDidMount() {
    const { zipFileStats } = await this.props.appContainer.apiGet('/v3/export/status', {});
    this.setState({ zipFileStats });
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

  async export() {
    // TODO use appContainer.apiv3.post
    const { zipFileStat } = await this.props.appContainer.apiPost('/v3/export', { collections: Array.from(this.state.collections) });
    // TODO toastSuccess, toastError
    this.setState((prevState) => {
      return {
        zipFileStats: [
          ...prevState.zipFileStats,
          zipFileStat,
        ],
      };
    });
  }

  async deleteZipFile(zipFile) {
    // TODO use appContainer.apiv3.delete
    await this.props.appContainer.apiRequest('delete', `/v3/export/${zipFile}`, {});

    this.setState((prevState) => {
      return {
        zipFileStats: prevState.zipFileStats.filter(stat => stat.fileName !== zipFile),
      };
    });
    // TODO toastSuccess, toastError
  }

  render() {
    // const { t } = this.props;
    const collections = ['pages', 'revisions'];

    return (
      <Fragment>
        <h2>Export Data as Zip</h2>
        <form className="my-5">
          {collections.map((collectionName) => {
            return (
              <div className="checkbox checkbox-info" key={collectionName}>
                <input
                  type="checkbox"
                  id={collectionName}
                  name={collectionName}
                  className="form-check-input"
                  value={collectionName}
                  checked={this.state.collections.has(collectionName)}
                  onChange={this.toggleCheckbox}
                />
                <label className="form-check-label ml-3" htmlFor={collectionName}>
                  {collectionName}
                </label>
              </div>
            );
          })}
        </form>
        <button type="button" className="btn btn-sm btn-default" onClick={this.export}>Generate</button>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>File</th>
              <th>Growi Version</th>
              <th>Collections</th>
              <th>Exported At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.zipFileStats.map(({ meta, fileName, fileStats }) => {
              return (
                <tr key={meta}>
                  <th>{fileName}</th>
                  <td>{meta.version}</td>
                  <td>{fileStats.map(fileStat => fileStat.collectionName).join(', ')}</td>
                  <td>{meta.exportedAt ? format(new Date(meta.exportedAt), 'yyyy/MM/dd HH:mm:ss') : ''}</td>
                  <td>
                    <a href="/_api/v3/export">
                      <button type="button" className="btn btn-sm btn-primary ml-2">Download</button>
                    </a>
                    <button type="button" className="btn btn-sm btn-danger ml-2" onClick={() => this.deleteZipFile(fileName)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }

}

ExportAsZip.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportAsZipWrapper = (props) => {
  return createSubscribedElement(ExportAsZip, props, [AppContainer]);
};

export default withTranslation()(ExportAsZipWrapper);
