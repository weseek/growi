import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import GrowiArchiveImportOption from '@commons/models/admin/growi-archive-import-option';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';


class GrowiZipImportConfigurationModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      option: Object.assign({}, this.props.option), // clone
    };

    this.initialize = this.initialize.bind(this);
    this.updateOption = this.updateOption.bind(this);
  }

  initialize() {
    this.setState({
      option: Object.assign({}, this.props.option), // clone
    });
  }

  /**
   * invoked when the value of control is changed
   * @param {object} updateObj
   */
  changeHandler(updateObj) {
    const { option } = this.state;
    Object.assign(option, updateObj);
    this.setState({ option });
  }

  updateOption() {
    const { collectionName, onOptionChange, onClose } = this.props;
    const { option } = this.state;

    if (onOptionChange != null) {
      onOptionChange(collectionName, option);
    }

    onClose();
  }

  renderPagesContents() {
    const { option } = this.state;

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt4"
            type="checkbox"
            checked={option.isOverwriteAuthorWithCurrentUser}
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt4">
            Overwrite page's author with the current user
            <p className="help-block mt-0">Recommended <span className="text-danger">NOT</span> to check this when users will also be restored.</p>
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            checked={option.makePublicForGrant2}
            onChange={() => this.changeHandler({ makePublicForGrant2: !option.makePublicForGrant2 })}
          />
          <label htmlFor="cbOpt1">
            Set 'Public' to the pages that is 'Anyone with the link'
            <p className="help-block mt-0">
              Make sure that this configuration makes all 'Anyone with the link' pages readable from <span className="text-danger">ANY</span> users.<br />
            </p>
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt2"
            type="checkbox"
            checked={option.makePublicForGrant4}
            onChange={() => this.changeHandler({ makePublicForGrant4: !option.makePublicForGrant4 })}
          />
          <label htmlFor="cbOpt2">
            Set 'Public' to the pages that is 'Just me'
            <p className="help-block mt-0">
              Make sure that this configuration makes all 'Just me' pages readable from <span className="text-danger">ANY</span> users.<br />
            </p>
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt3"
            type="checkbox"
            checked={option.makePublicForGrant5}
            onChange={() => this.changeHandler({ makePublicForGrant5: !option.makePublicForGrant5 })}
          />
          <label htmlFor="cbOpt3">
            Set 'Public' to the pages that is 'Only inside the group'
            <p className="help-block mt-0">
              Make sure that this configuration makes all 'Only inside the group' pages readable from <span className="text-danger">ANY</span> users.<br />
            </p>
          </label>
        </div>
        <div className="checkbox checkbox-default">
          <input
            id="cbOpt5"
            type="checkbox"
            checked={option.initPageMetadatas}
            onChange={() => this.changeHandler({ initPageMetadatas: !option.initPageMetadatas })}
          />
          <label htmlFor="cbOpt5">
            Initialize page's like, read users and comment count
            <p className="help-block mt-0">Recommended <span className="text-danger">NOT</span> to check this when users will also be restored.</p>
          </label>
        </div>
        <div className="checkbox checkbox-default">
          <input
            id="cbOpt6"
            type="checkbox"
            checked={option.initHackmdDatas}
            onChange={() => this.changeHandler({ initHackmdDatas: !option.initHackmdDatas })}
          />
          <label htmlFor="cbOpt6">
            Initialize HackMD related data
            <p className="help-block mt-0">Recommended to check this unless there is important drafts on HackMD.</p>
          </label>
        </div>
      </>
    );
    /* eslint-enable react/no-unescaped-entities */
  }

  renderRevisionsContents() {
    const { option } = this.state;

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            checked={option.isOverwriteAuthorWithCurrentUser}
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt1">
            Overwrite page's author with the current user
            <p className="help-block mt-0">Recommended <span className="text-danger">NOT</span> to check this when users will also be restored.</p>
          </label>
        </div>
      </>
    );
    /* eslint-enable react/no-unescaped-entities */
  }

  render() {
    const { t, collectionName } = this.props;

    let contents = null;
    switch (collectionName) {
      case 'pages':
        contents = this.renderPagesContents();
        break;
      case 'revisions':
        contents = this.renderRevisionsContents();
        break;
    }

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose} onExited={this.initialize}>
        <Modal.Header closeButton>
          <Modal.Title>{`'${collectionName}'`} Configuration</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {contents}
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-sm btn-default" onClick={this.props.onClose}>{t('Cancel')}</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={this.updateOption}>{t('Update')}</button>
        </Modal.Footer>
      </Modal>
    );
  }

}

GrowiZipImportConfigurationModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOptionChange: PropTypes.func,

  collectionName: PropTypes.string,
  option: PropTypes.instanceOf(GrowiArchiveImportOption).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiZipImportConfigurationModalWrapper = (props) => {
  return createSubscribedElement(GrowiZipImportConfigurationModal, props, [AppContainer]);
};

export default withTranslation()(GrowiZipImportConfigurationModalWrapper);
