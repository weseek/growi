import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';


import PageContainer from '~/client/services/PageContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Delete, apiv3Get } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import ShareLinkForm from './ShareLinkForm';
import ShareLinkList from './ShareLinkList';

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
    const { pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    try {
      const res = await apiv3Get('/share-links/', { relatedPage: pageId });
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
    const { t, pageContainer } = this.props;
    const { pageId } = pageContainer.state;

    try {
      const res = await apiv3Delete('/share-links/', { relatedPage: pageId });
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
    }
    catch (err) {
      toastError(err);
    }

    this.retrieveShareLinks();
  }

  async deleteLinkById(shareLinkId) {
    const { t } = this.props;

    try {
      const res = await apiv3Delete(`/share-links/${shareLinkId}`);
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
      <div className="container p-0">
        <h3 className="grw-modal-head d-flex pb-2">
          { t('share_links.share_link_list') }
          <button className="btn btn-danger ml-auto " type="button" onClick={this.deleteAllLinksButtonHandler}>{t('delete_all')}</button>
        </h3>

        <div>
          <ShareLinkList
            shareLinks={this.state.shareLinks}
            onClickDeleteButton={this.deleteLinkById}
          />
          <button
            className="btn btn-outline-secondary d-block mx-auto px-5"
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

ShareLink.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

const ShareLinkWrapperFC = (props) => {
  const { t } = useTranslation();
  return <ShareLink t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ShareLinkWrapper = withUnstatedContainers(ShareLinkWrapperFC, [PageContainer]);

export default ShareLinkWrapper;
