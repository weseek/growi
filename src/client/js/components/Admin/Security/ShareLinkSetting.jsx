import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import PaginationWrapper from '../../PaginationWrapper';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import DeleteAllShareLinksModal from './DeleteAllShareLinksModal';

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

    try {
      const res = await appContainer.apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }

    this.getShareLinkList(adminGeneralSecurityContainer.state.shareLinksActivePage);
  }


  render() {
    const { t, adminGeneralSecurityContainer } = this.props;

    const pager = (
      <div className="pull-right my-3">
        <PaginationWrapper
          activePage={adminGeneralSecurityContainer.state.shareLinksActivePage}
          changePage={this.getShareLinkList}
          totalItemsCount={adminGeneralSecurityContainer.state.totalshareLinks}
          pagingLimit={adminGeneralSecurityContainer.state.shareLinksPagingLimit}
        />
      </div>
    );

    const deleteAllButton = (
      adminGeneralSecurityContainer.state.shareLinks.length > 0
        ? (
          <button
            className="pull-right btn btn-danger"
            type="button"
            onClick={this.showDeleteConfirmModal}
          >
            {t('share_links.delete_all_share_links')}
          </button>
        )
        : (
          <p className="pull-right mr-2">{t('share_links.No_share_links')}</p>
        )
    );

    return (
      <Fragment>
        <div className="mb-3">
          {deleteAllButton}
          <h2 className="alert-anchor border-bottom">{t('share_links.share_link_management')}</h2>
        </div>

        {pager}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>{t('Share Link')}</th>
                <th>{t('Page Path')}</th>
                <th>{t('expire')}</th>
                <th>{t('description')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {adminGeneralSecurityContainer.state.shareLinks.map((sharelink) => {
                return (
                  <tr key={sharelink._id}>
                    <td>{sharelink._id}</td>
                    <td><a href={sharelink.relatedPage.path}>{sharelink.relatedPage.path}</a></td>
                    <td>{sharelink.expiredAt}</td>
                    <td>{sharelink.description}</td>
                    <td>
                      <button
                        className="btn btn-outline-warning"
                        type="button"
                        shareLinks={sharelink._id}
                        onClick={() => { this.deleteLinkById(sharelink._id) }}
                      >
                        <i className="icon-trash mr-2"></i>{t('Delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DeleteAllShareLinksModal
          isOpen={this.state.isDeleteConfirmModalShown}
          onClose={this.closeDeleteConfirmModal}
          count={adminGeneralSecurityContainer.state.shareLinks.length}
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
