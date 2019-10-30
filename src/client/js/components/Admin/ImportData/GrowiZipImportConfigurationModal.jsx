/* eslint-disable react/no-danger */

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
      option: null,
    };

    this.initialize = this.initialize.bind(this);
    this.updateOption = this.updateOption.bind(this);
  }

  async initialize() {
    await this.setState({
      option: Object.assign({}, this.props.option), // clone
    });
  }

  /**
   * invoked when the value of control is changed
   * @param {object} updateObj
   */
  changeHandler(updateObj) {
    const { option } = this.state;
    const newOption = Object.assign(option, updateObj);
    this.setState({ option: newOption });
  }

  updateOption() {
    const {
      collectionName, onOptionChange, onClose,
    } = this.props;

    if (onOptionChange != null) {
      onOptionChange(collectionName, this.state.option);
    }

    onClose();
  }

  renderPagesContents() {
    const { t } = this.props;
    const { option } = this.state;

    const translationBase = 'importer_management.growi_settings.configuration.pages';

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt4"
            type="checkbox"
            checked={option.isOverwriteAuthorWithCurrentUser || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt4">
            {t(`${translationBase}.overwrite_author.label`)}
            <p className="help-block mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.overwrite_author.desc`) }} />
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            checked={option.makePublicForGrant2 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant2: !option.makePublicForGrant2 })}
          />
          <label htmlFor="cbOpt1">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Anyone with the link') })}
            <p
              className="help-block mt-0"
              dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Anyone with the link') }) }}
            />
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt2"
            type="checkbox"
            checked={option.makePublicForGrant4 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant4: !option.makePublicForGrant4 })}
          />
          <label htmlFor="cbOpt2">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Just me') })}
            <p className="help-block mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Just me') }) }} />
          </label>
        </div>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt3"
            type="checkbox"
            checked={option.makePublicForGrant5 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant5: !option.makePublicForGrant5 })}
          />
          <label htmlFor="cbOpt3">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Only inside the group') })}
            <p
              className="help-block mt-0"
              dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Only inside the group') }) }}
            />
          </label>
        </div>
        <div className="checkbox checkbox-default">
          <input
            id="cbOpt5"
            type="checkbox"
            checked={option.initPageMetadatas || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ initPageMetadatas: !option.initPageMetadatas })}
          />
          <label htmlFor="cbOpt5">
            {t(`${translationBase}.initialize_meta_datas.label`)}
            <p className="help-block mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.initialize_meta_datas.desc`) }} />
          </label>
        </div>
        <div className="checkbox checkbox-default">
          <input
            id="cbOpt6"
            type="checkbox"
            checked={option.initHackmdDatas || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ initHackmdDatas: !option.initHackmdDatas })}
          />
          <label htmlFor="cbOpt6">
            {t(`${translationBase}.initialize_hackmd_related_datas.label`)}
            <p className="help-block mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.initialize_hackmd_related_datas.desc`) }} />
          </label>
        </div>
      </>
    );
    /* eslint-enable react/no-unescaped-entities */
  }

  renderRevisionsContents() {
    const { t } = this.props;
    const { option } = this.state;

    const translationBase = 'importer_management.growi_settings.configuration.revisions';

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="checkbox checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            checked={option.isOverwriteAuthorWithCurrentUser || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt1">
            {t(`${translationBase}.overwrite_author.label`)}
            <p className="help-block mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.overwrite_author.desc`) }} />
          </label>
        </div>
      </>
    );
    /* eslint-enable react/no-unescaped-entities */
  }

  render() {
    const { t, collectionName } = this.props;
    const { option } = this.state;

    let contents = null;
    if (option != null) {
      switch (collectionName) {
        case 'pages':
          contents = this.renderPagesContents();
          break;
        case 'revisions':
          contents = this.renderRevisionsContents();
          break;
      }
    }

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose} onEnter={this.initialize}>
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
