import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';
import * as toastr from 'toastr';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportZipFormModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: new Set(),
    };

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
    this.setState({ collections: new Set(this.props.collections) });
  }

  uncheckAll() {
    this.setState({ collections: new Set() });
  }

  async export(e) {
    e.preventDefault();

    try {
      // TODO use appContainer.apiv3.post
      const { zipFileStat } = await this.props.appContainer.apiPost('/v3/export', { collections: Array.from(this.state.collections) });
      // TODO toastSuccess, toastError
      this.props.onZipFileStatAdd(zipFileStat);
      this.props.onClose();

      // TODO toastSuccess, toastError
      toastr.success(undefined, `Generated ${zipFileStat.fileName}`, {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
    }
    catch (err) {
      // TODO toastSuccess, toastError
      toastr.error(err, 'Error', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }

  validateForm() {
    return this.state.collections.size > 0;
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('export_management.export_collections')}</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.export}>
          <Modal.Body>
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
            <div className="checkbox checkbox-info">
              {this.props.collections.map((collectionName) => {
                return (
                  <div className="my-1" key={collectionName}>
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
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn-sm btn-default" onClick={this.props.onClose}>{t('export_management.cancel')}</button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={!this.validateForm()}>{t('export_management.export')}</button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

}

ExportZipFormModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(PropTypes.string).isRequired,
  zipFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  onZipFileStatAdd: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportZipFormModalWrapper = (props) => {
  return createSubscribedElement(ExportZipFormModal, props, [AppContainer]);
};

export default withTranslation()(ExportZipFormModalWrapper);
