import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportZipForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: new Set(),
    };

    this.collections = ['pages', 'revisions'];

    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.export = this.export.bind(this);
    this.validateForm = this.validateForm.bind(this);
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

  checkAll() {
    this.setState({ collections: new Set(this.collections) });
  }

  uncheckAll() {
    this.setState({ collections: new Set() });
  }

  async export(e) {
    e.preventDefault();

    // TODO use appContainer.apiv3.post
    const { zipFileStat } = await this.props.appContainer.apiPost('/v3/export', { collections: Array.from(this.state.collections) });
    // TODO toastSuccess, toastError
    this.props.onZipFileStatAdd(zipFileStat);
  }

  validateForm() {
    return this.state.collections.size > 0;
  }

  render() {
    const { t } = this.props;

    return (
      <form className="my-5" onSubmit={this.export}>
        <div className="row">
          <div className="col-sm-12">
            <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.checkAll}>
              <i className="fa fa-check-square-o"></i> {t('export_management.check_all')}
            </button>
            <button type="button" className="btn btn-sm btn-default mr-2" onClick={this.uncheckAll}>
              <i className="fa fa-square-o"></i> {t('export_management.uncheck_all')}
            </button>
          </div>
        </div>
        <div className="row checkbox checkbox-info my-5">
          {this.collections.map((collectionName) => {
          return (
            <div className="col-md-6 my-1" key={collectionName}>
              <input
                type="checkbox"
                id={collectionName}
                name={collectionName}
                className="form-check-input"
                value={collectionName}
                checked={this.state.collections.has(collectionName)}
                onChange={this.toggleCheckbox}
              />
              <label className="text-capitalize form-check-label ml-3" htmlFor={collectionName}>
                {collectionName}
              </label>
            </div>
          );
        })}
        </div>
        <div className="row">
          <div className="col-sm-12 text-center">
            <button type="submit" className="btn btn-sm btn-primary" disabled={!this.validateForm()}>{t('export_management.export')}</button>
          </div>
        </div>
      </form>
    );
  }

}

ExportZipForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  zipFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  onZipFileStatAdd: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportZipFormWrapper = (props) => {
  return createSubscribedElement(ExportZipForm, props, [AppContainer]);
};

export default withTranslation()(ExportZipFormWrapper);
