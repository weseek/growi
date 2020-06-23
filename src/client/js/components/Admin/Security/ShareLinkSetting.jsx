import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import ShareLinkList from '../../ShareLinkList';
import DeleteAllShareLinksModal from './DeleteAllShareLinksModal';

class ShareLinkSetting extends React.Component {

  constructor() {
    super();

    this.state = {
      shareLinks: [],
      isDeleteConfirmModalShown: false,
    };

    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.deleteAllLinksButtonHandler = this.deleteAllLinksButtonHandler.bind(this);
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
      console.log(res);
      const count = res.data.n;
      toastSuccess(t('toaster.remove_share_link', { count }));
    }
    catch (err) {
      toastError(err);
    }

  }


  render() {
    return (
      <>
        <h2 className="border-bottom mb-3">
          Shared Link List

          <button type="button" className="btn btn-danger pull-right" onClick={this.showDeleteConfirmModal}>Delete all links</button>
        </h2>

        <ShareLinkList
          shareLinks={this.state.shareLinks}
          onClickDeleteButton={this.deleteLinkById}
        />

        <DeleteAllShareLinksModal
          isOpen={this.state.isDeleteConfirmModalShown}
          onClose={this.closeDeleteConfirmModal}
          count={this.state.shareLinks.length}
          onClickDeleteButton={this.deleteAllLinksButtonHandler}
        />

      </>
    );
  }

}

const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSetting, [AppContainer, AdminGeneralSecurityContainer]);

ShareLinkSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ShareLinkSettingWrapper);
