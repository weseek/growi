import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

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
  }

  showDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: true });
  }

  closeDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: false });
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
        />

      </>
    );
  }

}

const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSetting, [AdminGeneralSecurityContainer]);

ShareLinkSetting.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

export default withTranslation()(ShareLinkSettingWrapper);
