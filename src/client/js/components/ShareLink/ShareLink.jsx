import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import ShareLinkList from '../ShareLinkList';
import ShareLinkForm from './ShareLinkForm';

import { toastSuccess, toastError } from '../../util/apiNotification';

class ShareLink extends React.Component {

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
    this.retrieveShareLinks();
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
      <div className="container">
        <h3 className="grw-modal-head  d-flex  pb-2">
          { t('share_links.share_link_list') }
          <button className="btn btn-danger ml-auto " type="button" onClick={this.deleteAllLinksButtonHandler}>{t('delete_all')}</button>
        </h3>

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
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ShareLinkWrapper = withUnstatedContainers(ShareLink, [AppContainer, PageContainer]);

ShareLink.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ShareLinkWrapper);
