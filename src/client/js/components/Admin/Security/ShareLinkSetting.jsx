import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import PaginationWrapper from '../../PaginationWrapper';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import DeleteAllShareLinksModal from './DeleteAllShareLinksModal';
import ShareLinkList from '../../ShareLink/ShareLinkList';


const Pager = (props) => {
  if (props.links.length === 0) {
    return null;
  }
  return (
    <PaginationWrapper
      activePage={props.activePage}
      changePage={props.handlePage}
      totalItemsCount={props.totalLinks}
      pagingLimit={props.limit}
      align="right"
      size="sm"
    />
  );
};

Pager.propTypes = {
  links: PropTypes.array.isRequired,
  activePage: PropTypes.number.isRequired,
  handlePage: PropTypes.func.isRequired,
  totalLinks: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};

class ShareLinkSetting extends React.Component {

  constructor() {
    super();

    this.state = {
      isDeleteConfirmModalShown: false,
    };
    this.getShareLinkList = this.getShareLinkList.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.deleteAllLinksButtonHandler = this.deleteAllLinksButtonHandler.bind(this);
    this.deleteLinkById = this.deleteLinkById.bind(this);
  }

  componentWillMount() {
    this.getShareLinkList(1);
  }

  async getShareLinkList(page) {
    try {
      await this.props.adminGeneralSecurityContainer.retrieveShareLinksByPagingNum(page);
    }
    catch (err) {
      toastError(err);
    }

  }

  showDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: true });
  }

  closeDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: false });
  }

  async deleteAllLinksButtonHandler() {
    const { t, appContainer } = this.props;

    try {
      const res = await appContainer.apiv3Delete('/share-links/all');
      const { deletedCount } = res.data;
      toastSuccess(t('toaster.remove_share_link', { count: deletedCount }));
    }
    catch (err) {
      toastError(err);
    }
    this.getShareLinkList(1);
  }

  async deleteLinkById(shareLinkId) {
    const { t, appContainer, adminGeneralSecurityContainer } = this.props;
    const { shareLinksActivePage } = adminGeneralSecurityContainer.state;

    try {
      const res = await appContainer.apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }

    this.getShareLinkList(shareLinksActivePage);
  }


  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    const {
      shareLinks, shareLinksActivePage, totalshareLinks, shareLinksPagingLimit,
    } = adminGeneralSecurityContainer.state;

    return (
      <Fragment>
        <div className="mb-3">
          <button
            className="pull-right btn btn-danger"
            disabled={shareLinks.length === 0}
            type="button"
            onClick={this.showDeleteConfirmModal}
          >
            {t('share_links.delete_all_share_links')}
          </button>
          <h2 className="alert-anchor border-bottom">{t('share_links.share_link_management')}</h2>
        </div>
        <Pager
          links={shareLinks}
          activePage={shareLinksActivePage}
          handlePage={this.getShareLinkList}
          totalLinks={totalshareLinks}
          limit={shareLinksPagingLimit}
        />

        {(shareLinks.length !== 0) ? (
          <ShareLinkList
            shareLinks={shareLinks}
            onClickDeleteButton={this.deleteLinkById}
            isAdmin
          />
          )
          : (<p className="text-center">{t('share_links.No_share_links')}</p>
          )
        }


        <DeleteAllShareLinksModal
          isOpen={this.state.isDeleteConfirmModalShown}
          onClose={this.closeDeleteConfirmModal}
          onClickDeleteButton={this.deleteAllLinksButtonHandler}
        />

      </Fragment>
    );
  }

}

const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSetting, [AppContainer, AdminGeneralSecurityContainer]);

ShareLinkSetting.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

export default withTranslation()(ShareLinkSettingWrapper);
