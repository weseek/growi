import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import PaginationWrapper from '../../PaginationWrapper';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import { toastSuccess, toastError } from '../../../util/apiNotification';

class ShareLinkSetting extends React.Component {

  constructor(props) {
    super();
    this.state = {
    };
    this.handlePage = this.handlePage.bind(this);
    this.deleteAllLinksButtonHandler = this.deleteAllLinksButtonHandler.bind(this);
    this.deleteLinkById = this.deleteLinkById.bind(this);
  }

  componentWillMount() {
    this.handlePage(1);
  }

  async handlePage(page) {
    try {
      await this.props.adminGeneralSecurityContainer.retrieveShareLinksByPagingNum(page);
    }
    catch (err) {
      toastError(err);
    }
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
    const { adminGeneralSecurityContainer } = this.props;

    const pager = (
      <div className="pull-right my-3">
        <PaginationWrapper
          activePage={adminGeneralSecurityContainer.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={adminGeneralSecurityContainer.state.totalshareLinks}
          pagingLimit={adminGeneralSecurityContainer.state.pagingLimit}
        />
      </div>
    );


    return (
      <Fragment>
        <div className="mb-3">
          <button className="pull-right btn btn-danger" type="button">Delete all links</button>
          <h2 className="alert-anchor border-bottom">Shared Link List</h2>
        </div>

        {pager}
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
              {adminGeneralSecurityContainer.state.shareLinks.map((sharelink) => {
                return (
                  <tr key={sharelink._id}>
                    <td>{sharelink._id}</td>
                    <td><a href={sharelink.relatedPage.path}>{sharelink.relatedPage.path}</a></td>
                    <td>{sharelink.expiredAt}</td>
                    <td>{sharelink.description}</td>
                    <td>
                      <button className="btn btn-outline-warning" type="button">
                        <i className="icon-trash"></i>Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
