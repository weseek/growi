import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      files: {},
    };

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.exportSingle = this.exportSingle.bind(this);
    this.deleteZipFile = this.deleteZipFile.bind(this);
  }

  async componentDidMount() {
    const res = await this.props.appContainer.apiGet('/v3/export', {});

    this.setState({ files: res.files });
  }

  toggleCheckbox(e) {
    const { target } = e;
    const { name, checked } = target;

    this.setState({
      [name]: checked,
    });
  }

  async exportSingle(collection) {
    // TODO use appContainer.apiv3.post
    const res = await this.props.appContainer.apiPost(`/v3/export/${collection}`, {});
    // TODO toastSuccess, toastError
    this.setState((prevState) => {
      return {
        files: {
          ...prevState.files,
          [res.collection]: res.file,
        },
      };
    });
  }

  async deleteZipFile() {
    // TODO use appContainer.apiv3.delete
    // TODO toastSuccess, toastError
  }

  render() {
    // const { t } = this.props;

    return (
      <Fragment>
        <h2>Export Data as Zip</h2>
        <form className="my-5">
          {Object.keys(this.state.files).map((file) => {
            const disabled = !(file === 'pages' || file === 'revisions');
            const stat = this.state.files[file] || {};
            return (
              <div className="checkbox checkbox-info" key={file}>
                <input
                  type="checkbox"
                  id={file}
                  name={file}
                  className="form-check-input"
                  value={file}
                  disabled={disabled}
                  checked={this.state[file]}
                  onChange={this.toggleCheckbox}
                />
                <label className={`form-check-label ml-3 ${disabled ? 'text-muted' : ''}`} htmlFor={file}>
                  {file} ({stat.name || 'not found'}) ({stat.mtime ? format(new Date(stat.mtime), 'yyyy/MM/dd HH:mm:ss') : ''})
                </label>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => this.exportSingle(file)} disabled={disabled}>
                  Create zip file
                </button>
              </div>
            );
          })}
        </form>
        <button type="button" className="btn btn-sm btn-default" onClick={this.exportSingle}>Generate</button>
        <a href="/_api/v3/export/pages">
          <button type="button" className="btn btn-sm btn-primary ml-2">Download</button>
        </a>
        {/* <button type="button" className="btn btn-sm btn-danger ml-2" onClick={this.deleteZipFile}>Clear</button> */}
      </Fragment>
    );
  }

}

ExportPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isAclEnabled: PropTypes.bool,
};

/**
 * Wrapper component for using unstated
 */
const ExportPageWrapper = (props) => {
  return createSubscribedElement(ExportPage, props, [AppContainer]);
};

export default withTranslation()(ExportPageWrapper);
