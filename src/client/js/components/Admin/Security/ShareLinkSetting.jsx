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

  async putShareLinkSettings() {
    const { t, adminGeneralSecurityContainer } = this.props;
    try {
      await adminGeneralSecurityContainer.updateGeneralSecuritySetting();
      toastSuccess(t('security_setting.updated_shareLink_setting'));
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
        {/* ここにShareLink Settingのdropdown button */}
        {/* <h4>{t('security_setting.page_access_and_delete_rights')}</h4>
        <div className="row mb-4">
          <div className="col-md-3 text-md-right py-2">
            <strong>{t('security_setting.Guest Users Access')}</strong>
          </div>
          <div className="col-md-9">
            <div className="dropdown">
              <button
                className={`btn btn-outline-secondary dropdown-toggle text-right col-12
                            col-md-auto ${adminGeneralSecurityContainer.isWikiModeForced && 'disabled'}`}
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                <span className="float-left">
                  {currentRestrictGuestMode === 'Deny' && t('security_setting.guest_mode.deny')}
                  {currentRestrictGuestMode === 'Readonly' && t('security_setting.guest_mode.readonly')}
                </span>
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Deny') }}>
                  {t('security_setting.guest_mode.deny')}
                </button>
                <button className="dropdown-item" type="button" onClick={() => { adminGeneralSecurityContainer.changeRestrictGuestMode('Readonly') }}>
                  {t('security_setting.guest_mode.readonly')}
                </button>
              </div>
            </div>
          </div>
        </div> */}
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

        {/* ここにUpdate button */}
        {/* <div className="row my-3">
          <div className="text-center text-md-left offset-md-3 col-md-5">
            <button type="button" className="btn btn-primary" disabled={adminGeneralSecurityContainer.retrieveError != null} onClick={this.putShareLinkSetting}>
              {t('Update')}
            </button>
          </div>
        </div> */}


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
