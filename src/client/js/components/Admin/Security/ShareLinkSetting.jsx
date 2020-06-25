import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import { toastSuccess, toastError } from '../../../util/apiNotification';

class ShareLinkSetting extends React.Component {

  constructor() {
    super();
    this.state = {
      // shareLinks: [],
      // TODO:GW-2958で実装
    };
    this.deleteAllLinksButtonHandler = this.deleteAllLinksButtonHandler.bind(this);
    this.deleteLinkById = this.deleteLinkById.bind(this);
  }


  async deleteLinkById() {
    const { t, adminGeneralSecurityContainer } = this.props;

    try {
      await adminGeneralSecurityContainer.deleteLinkById();
      toastSuccess(t('security_setting.updated_general_security_setting'));
      // TODO:GW-2827,GW-2826で実装する
    }
    catch (err) {
      toastError(err);
    }

    // this.retrieveShareLinks();
    // TODO:後で作る
  }

  async deleteAllLinksButtonHandler() {
    const { t, adminGeneralSecurityContainer } = this.props;
    try {
      await adminGeneralSecurityContainer.deleteAllLinksButtonHandler();
      toastSuccess(t('security_setting.updated_general_security_setting'));
      // TODO:GW-2827,GW-2960で実装する
    }
    catch (err) {
      toastError(err);
    }

    // this.retrieveShareLinks();
    // TODO:後で作る
  }

  render() {
    return (
      <Fragment>
        <div className="mb-3">
          <h2 className="alert-anchor border-bottom">Shared Link List</h2>
        </div>
        <button className="pull-right btn btn-danger" type="button">Delete all links</button>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Link</th>
                <th>PagePath</th>
                <th>Expiration</th>
                <th>Description</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {/* <ShareLinkList
                shareLinks={this.state.shareLinks}
                onClickDeleteButton={this.deleteLinkById}
              /> */}
              {/* TODO:GW-2827で実装 */}
            </tbody>
          </table>
        </div>

      </Fragment>
    );
  }

}

const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSetting, [AdminGeneralSecurityContainer]);

ShareLinkSetting.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

export default withTranslation()(ShareLinkSettingWrapper);
