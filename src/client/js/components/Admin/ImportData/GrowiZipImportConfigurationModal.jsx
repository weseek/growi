import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

import GrowiZipImportOption from '../../../models/GrowiZipImportOption';


class GrowiZipImportConfigurationModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      importOptions: this.props.importOptions,
    };
  }

  render() {
    const { t, collectionName } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        {/* eslint-disable react/no-unescaped-entities */}

        <Modal.Header closeButton>
          <Modal.Title>{`'${collectionName}'`} Configuration</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="checkbox checkbox-warning">
            <input id="cbOpt4" type="checkbox" />
            <label htmlFor="cbOpt4">
              Overwrite page's author with the current user
              <p className="help-block mt-0">Recommended <span className="text-danger">NOT</span> to check this when users will also be restored.</p>
            </label>
          </div>
          <div className="checkbox checkbox-warning">
            <input id="cbOpt1" type="checkbox" />
            <label htmlFor="cbOpt1">
              Set 'Public' to the pages that is 'Anyone with the link'
              <p className="help-block mt-0">
                Make sure that this configuration makes all 'Anyone with the link' pages readable from <span className="text-danger">ANY</span> users.<br />
              </p>
            </label>
          </div>
          <div className="checkbox checkbox-warning">
            <input id="cbOpt2" type="checkbox" />
            <label htmlFor="cbOpt2">
              Set 'Public' to the pages that is 'Just me'
              <p className="help-block mt-0">
                Make sure that this configuration makes all 'Just me' pages readable from <span className="text-danger">ANY</span> users.<br />
              </p>
            </label>
          </div>
          <div className="checkbox checkbox-warning">
            <input id="cbOpt3" type="checkbox" />
            <label htmlFor="cbOpt3">
              Set 'Public' to the pages that is 'Only inside the group'
              <p className="help-block mt-0">
                Make sure that this configuration makes all 'Only inside the group' pages readable from <span className="text-danger">ANY</span> users.<br />
              </p>
            </label>
          </div>
          <div className="checkbox checkbox-default">
            <input id="cbOpt5" type="checkbox" />
            <label htmlFor="cbOpt5">
              Initialize page's like, read users and comment count
              <p className="help-block mt-0">Recommended <span className="text-danger">NOT</span> to check this when users will also be restored.</p>
            </label>
          </div>
          <div className="checkbox checkbox-default">
            <input id="cbOpt6" type="checkbox" />
            <label htmlFor="cbOpt6">
              Initialize HackMD related data
              <p className="help-block mt-0">Recommended to check this unless there is important drafts on HackMD.</p>
            </label>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

}

GrowiZipImportConfigurationModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  collectionName: PropTypes.string,
  importOption: PropTypes.instanceOf(GrowiZipImportOption).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiZipImportConfigurationModalWrapper = (props) => {
  return createSubscribedElement(GrowiZipImportConfigurationModal, props, [AppContainer]);
};

export default withTranslation()(GrowiZipImportConfigurationModalWrapper);
