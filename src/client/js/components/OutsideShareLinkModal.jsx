import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import ShareLinkList from './ShareLinkList';
import ShareLinkForm from './ShareLinkForm';

import { toastSuccess, toastError } from '../util/apiNotification';

class OutsideShareLinkModal extends React.Component {

  constructor() {
    super();
    this.state = {
      shareLinks: [],
      isOpenShareLinkForm: false,
    };

    this.toggleShareLinkFormHandler = this.toggleShareLinkFormHandler.bind(this);
    this.deleteAllLinksButtonHandler = this.deleteAllLinksButtonHandler.bind(this);
    this.deleteLinkById = this.deleteLinkById.bind(this);
  }

  componentDidMount() {
    this.retrieveShareLinks();
  }

  async retrieveShareLinks() {
    const { appContainer, pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    try {
      const res = await appContainer.apiv3.get('/share-links/', { relatedPage: pageId });
      const { shareLinksResult } = res.data;
      this.setState({ shareLinks: shareLinksResult });
    }
    catch (err) {
      toastError(err);
    }

  }

  toggleShareLinkFormHandler() {
    this.setState({ isOpenShareLinkForm: !this.state.isOpenShareLinkForm });
  }

  async deleteAllLinksButtonHandler() {
    const { t, appContainer, pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    try {
      const res = await appContainer.apiv3.delete('/share-links/', { relatedPage: pageId });
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
    }
    catch (err) {
      toastError(err);
    }

    this.retrieveShareLinks();
  }

  async deleteLinkById(shareLinkId) {
    const { t, appContainer } = this.props;

    try {
      const res = await appContainer.apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }

    this.retrieveShareLinks();
  }

  render() {
    const { t } = this.props;
    return (
      <Modal size="lg" isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-primary text-light">{t('share_links.Shere this page link to public')}
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="form-inline mb-3">
              <h4>{t('share_links.share_link_list')}</h4>
              <button className="ml-auto btn btn-danger" type="button" onClick={this.deleteAllLinksButtonHandler}>{t('delete_all')}</button>
            </div>

            <div>
              <ShareLinkList
                shareLinks={this.state.shareLinks}
                onClickDeleteButton={this.deleteLinkById}
              />
              <button
                className="btn btn-outline-secondary d-block mx-auto px-5 mb-3"
                type="button"
                onClick={this.toggleShareLinkFormHandler}
              >
                {this.state.isOpenShareLinkForm ? t('Close') : t('New')}
              </button>
              {this.state.isOpenShareLinkForm && <ShareLinkForm onCloseForm={this.toggleShareLinkFormHandler} />}
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = withUnstatedContainers(OutsideShareLinkModal, [AppContainer, PageContainer]);

OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ModalControlWrapper);
