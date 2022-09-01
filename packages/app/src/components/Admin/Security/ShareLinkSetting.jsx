import React, { Fragment } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminGeneralSecurityContainer from '~/client/services/AdminGeneralSecurityContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Delete } from '~/client/util/apiv3-client';

import PaginationWrapper from '../../PaginationWrapper';
import ShareLinkList from '../../ShareLink/ShareLinkList';
import { withUnstatedContainers } from '../../UnstatedUtils';


import DeleteAllShareLinksModal from './DeleteAllShareLinksModal';

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
      align="center"
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
    this.switchDisableLinkSharing = this.switchDisableLinkSharing.bind(this);
  }

  UNSAFE_componentWillMount() {
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
    const { t } = this.props;

    try {
      const res = await apiv3Delete('/share-links/all');
      const { deletedCount } = res.data;
      toastSuccess(t('toaster.remove_share_link', { count: deletedCount }));
    }
    catch (err) {
      toastError(err);
    }
    this.getShareLinkList(1);
  }

  async deleteLinkById(shareLinkId) {
    const { t, adminGeneralSecurityContainer } = this.props;
    const { shareLinksActivePage } = adminGeneralSecurityContainer.state;

    try {
      const res = await apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess(t('toaster.remove_share_link_success', { shareLinkId: deletedShareLink._id }));
    }
    catch (err) {
      toastError(err);
    }

    this.getShareLinkList(shareLinksActivePage);
  }

  async switchDisableLinkSharing() {
    const { t, adminGeneralSecurityContainer } = this.props;
    try {
      await adminGeneralSecurityContainer.switchDisableLinkSharing();
      toastSuccess(t('toaster.switch_disable_link_sharing_success'));
    }
    catch (err) {
      toastError(err);
    }
  }


  render() {
    const { t, adminGeneralSecurityContainer } = this.props;
    const {
      shareLinks, shareLinksActivePage, totalshareLinks, shareLinksPagingLimit, disableLinkSharing,
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
        <h4>{t('security_settings.share_link_rights')}</h4>
        <div className="row mb-5">
          <div className="col-6 offset-3">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                type="checkbox"
                className="custom-control-input"
                id="disableLinkSharing"
                checked={!disableLinkSharing}
                onChange={() => this.switchDisableLinkSharing()}
              />
              <label className="custom-control-label" htmlFor="disableLinkSharing">
                {t('security_settings.enable_link_sharing')}
              </label>
            </div>
            {!adminGeneralSecurityContainer.state.setupStrategies.includes('local') && disableLinkSharing && (
              <div className="badge badge-warning">{t('security_settings.setup_is_not_yet_complete')}</div>
            )}
          </div>
        </div>
        <h4>{t('security_settings.all_share_links')}</h4>
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

ShareLinkSetting.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const ShareLinkSettingWrapperFC = (props) => {
  const { t } = useTranslation('admin');
  return <ShareLinkSetting t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSettingWrapperFC, [AdminGeneralSecurityContainer]);

export default ShareLinkSettingWrapper;
