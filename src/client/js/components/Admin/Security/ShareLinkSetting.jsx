import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import PaginationWrapper from '../../PaginationWrapper';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

import { toastError } from '../../../util/apiNotification';

class ShareLinkSetting extends React.Component {

  constructor(props) {
    super();
    this.state = {
    };
    this.getShareLinkList = this.getShareLinkList.bind(this);
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

  render() {
    const { adminGeneralSecurityContainer } = this.props;

    const pager = (
      <div className="pull-right my-3">
        <PaginationWrapper
          activePage={adminGeneralSecurityContainer.state.activePage}
          changePage={this.getShareLinkList}
          totalItemsCount={adminGeneralSecurityContainer.state.totalshareLinks}
          pagingLimit={adminGeneralSecurityContainer.state.pagingLimit}
        />
      </div>
    );

    const deleteAllButton = (
      adminGeneralSecurityContainer.state.shareLinks.length > 0
        ? (
          <button
            className="pull-right btn btn-danger"
            type="button"
          >
            Delete all links
          </button>
        )
        : (
          <p className="pull-right mr-2">No share links</p>
        )
    );

    return (
      <Fragment>
        <div className="mb-3">
          {deleteAllButton}
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
                        <i className="icon-trash mr-2"></i>Delete
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
