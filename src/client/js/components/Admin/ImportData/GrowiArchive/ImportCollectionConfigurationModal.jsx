/* eslint-disable react/no-danger */

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import GrowiArchiveImportOption from '@commons/models/admin/growi-archive-import-option';

import { withUnstatedContainers } from '../../../UnstatedUtils';
import AppContainer from '../../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';


class ImportCollectionConfigurationModal extends React.Component {

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

    const translationBase = 'admin:importer_management.growi_settings.configuration.pages';

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt4"
            type="checkbox"
            className="custom-control-input"
            checked={option.isOverwriteAuthorWithCurrentUser || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt4" className="custom-control-label">
            {t(`${translationBase}.overwrite_author.label`)}
            <p className="form-text text-muted mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.overwrite_author.desc`) }} />
          </label>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            className="custom-control-input"
            checked={option.makePublicForGrant2 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant2: !option.makePublicForGrant2 })}
          />
          <label htmlFor="cbOpt1" className="custom-control-label">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Anyone with the link') })}
            <p
              className="form-text text-muted mt-0"
              dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Anyone with the link') }) }}
            />
          </label>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt2"
            type="checkbox"
            className="custom-control-input"
            checked={option.makePublicForGrant4 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant4: !option.makePublicForGrant4 })}
          />
          <label htmlFor="cbOpt2" className="custom-control-label">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Only me') })}
            <p
              className="form-text text-muted mt-0"
              dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Only me') }) }}
            />
          </label>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt3"
            type="checkbox"
            className="custom-control-input"
            checked={option.makePublicForGrant5 || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ makePublicForGrant5: !option.makePublicForGrant5 })}
          />
          <label htmlFor="cbOpt3" className="custom-control-label">
            {t(`${translationBase}.set_public_to_page.label`, { from: t('Only inside the group') })}
            <p
              className="form-text text-muted mt-0"
              dangerouslySetInnerHTML={{ __html: t(`${translationBase}.set_public_to_page.desc`, { from: t('Only inside the group') }) }}
            />
          </label>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt5"
            type="checkbox"
            className="custom-control-input"
            checked={option.initPageMetadatas || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ initPageMetadatas: !option.initPageMetadatas })}
          />
          <label htmlFor="cbOpt5" className="custom-control-label">
            {t(`${translationBase}.initialize_meta_datas.label`)}
            <p className="form-text text-muted mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.initialize_meta_datas.desc`) }} />
          </label>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt6"
            type="checkbox"
            className="custom-control-input"
            checked={option.initHackmdDatas || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ initHackmdDatas: !option.initHackmdDatas })}
          />
          <label htmlFor="cbOpt6" className="custom-control-label">
            {t(`${translationBase}.initialize_hackmd_related_datas.label`)}
            <p className="form-text text-muted mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.initialize_hackmd_related_datas.desc`) }} />
          </label>
        </div>
      </>
    );
    /* eslint-enable react/no-unescaped-entities */
  }

  renderRevisionsContents() {
    const { t } = this.props;
    const { option } = this.state;

    const translationBase = 'admin:importer_management.growi_settings.configuration.revisions';

    /* eslint-disable react/no-unescaped-entities */
    return (
      <>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            id="cbOpt1"
            type="checkbox"
            className="custom-control-input"
            checked={option.isOverwriteAuthorWithCurrentUser || false} // add ' || false' to avoid uncontrolled input warning
            onChange={() => this.changeHandler({ isOverwriteAuthorWithCurrentUser: !option.isOverwriteAuthorWithCurrentUser })}
          />
          <label htmlFor="cbOpt1" className="custom-control-label">
            {t(`${translationBase}.overwrite_author.label`)}
            <p className="form-text text-muted mt-0" dangerouslySetInnerHTML={{ __html: t(`${translationBase}.overwrite_author.desc`) }} />
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
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose} onEnter={this.initialize}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-info text-light">
          {`'${collectionName}'`} Configuration
        </ModalHeader>

        <ModalBody>
          {contents}
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.props.onClose}>{t('Cancel')}</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={this.updateOption}>{t('Update')}</button>
        </ModalFooter>
      </Modal>
    );
  }

}

ImportCollectionConfigurationModal.propTypes = {
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
const ImportCollectionConfigurationModalWrapper = withUnstatedContainers(ImportCollectionConfigurationModal, [AppContainer]);

export default withTranslation()(ImportCollectionConfigurationModalWrapper);
