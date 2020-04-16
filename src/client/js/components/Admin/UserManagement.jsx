import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PaginationWrapper from '../PaginationWrapper';


import { createSubscribedElement } from '../UnstatedUtils';
import { toastError } from '../../util/apiNotification';

import AppContainer from '../../services/AppContainer';
import AdminUsersContainer from '../../services/AdminUsersContainer';

import PasswordResetModal from './Users/PasswordResetModal';
import InviteUserControl from './Users/InviteUserControl';
import UserTable from './Users/UserTable';

class UserManagement extends React.Component {

  constructor(props) {
    super();

    this.state = {
      isNotifyCommentShow: false,
    };

    this.handlePage = this.handlePage.bind(this);
    this.handleChangeSearchText = this.handleChangeSearchText.bind(this);
  }

  componentWillMount() {
    this.handlePage(1);
  }

  async handlePage(selectedPage) {
    try {
      await this.props.adminUsersContainer.retrieveUsersByPagingNum(selectedPage);
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * For checking same check box twice
   * @param {string} statusType
   */
  async handleClick(statusType) {
    const { adminUsersContainer } = this.props;
    if (!this.validateToggleStatus(statusType)) {
      return this.setState({ isNotifyCommentShow: true });
    }

    if (this.state.isNotifyCommentShow) {
      await this.setState({ isNotifyCommentShow: false });
    }
    adminUsersContainer.handleClick(statusType);
  }

  /**
   * Workaround user status check box
   * @param {string} statusType
   */
  validateToggleStatus(statusType) {
    if (this.props.adminUsersContainer.isSelected(statusType)) {
      return this.props.adminUsersContainer.state.selectedStatusList.size > 1;
    }
    return true;
  }

  /**
   * Reset button
   */
  resetButtonClickHandler() {
    const { adminUsersContainer } = this.props;
    try {
      adminUsersContainer.resetAllChanges();
      this.searchUserElement.value = '';
      this.state.isNotifyCommentShow = false;
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Workaround increamental search
   * @param {string} event
   */
  handleChangeSearchText(event) {
    this.props.adminUsersContainer.handleChangeSearchText(event.target.value);
  }

  render() {
    const { t, adminUsersContainer } = this.props;

    const pager = (
      <div className="pull-right my-3">
        <PaginationWrapper
          activePage={adminUsersContainer.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={adminUsersContainer.state.totalUsers}
          pagingLimit={adminUsersContainer.state.pagingLimit}
        />
      </div>
    );

    const clearButton = (
      adminUsersContainer.state.searchText.length > 0
        ? (
          <i
            className="icon-close search-clear"
            onClick={() => {
              adminUsersContainer.clearSearchText();
              this.searchUserElement.value = '';
            }}
          />
        )
        : ''
    );

    return (
      <Fragment>
        {adminUsersContainer.state.userForPasswordResetModal && <PasswordResetModal />}
        <p>
          <InviteUserControl />
          <a className="btn text-dark btn-outline-secondary ml-2" href="/admin/users/external-accounts" role="button">
            <i className="icon-user-follow" aria-hidden="true"></i>
            {t('admin:user_management.external_account')}
          </a>
        </p>

        <h2>{t('User_Management')}</h2>

        <div className="border-top border-bottom">

          <div className="d-flex justify-content-start align-items-center my-2">
            <div>
              <i className="icon-magnifier mr-1"></i>
              <span className="search-typeahead">
                <input
                  type="text"
                  ref={(searchUserElement) => { this.searchUserElement = searchUserElement }}
                  onChange={this.handleChangeSearchText}
                />
                { clearButton }
              </span>
            </div>

            <div className="mx-5 form-inline">
              <div className="custom-control custom-checkbox custom-checkbox-primary mr-2">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  id="c1"
                  checked={adminUsersContainer.isSelected('all')}
                  onClick={() => { this.handleClick('all') }}
                />
                <label className="custom-control-label" htmlFor="c1">
                  <span className="badge badge-pill badge-primary d-inline-block vt mt-1">All</span>
                </label>
              </div>

              <div className="custom-control custom-checkbox custom-checkbox-info mr-2">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  id="c2"
                  checked={adminUsersContainer.isSelected('registered')}
                  onClick={() => { this.handleClick('registered') }}
                />
                <label className="custom-control-label" htmlFor="c2">
                  <span className="badge badge-pill badge-info d-inline-block vt mt-1">Approval Pending</span>
                </label>
              </div>

              <div className="custom-control custom-checkbox custom-checkbox-success mr-2">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  id="c3"
                  checked={adminUsersContainer.isSelected('active')}
                  onClick={() => { this.handleClick('active') }}
                />
                <label className="custom-control-label" htmlFor="c3">
                  <span className="badge badge-pill badge-success d-inline-block vt mt-1">Active</span>
                </label>
              </div>

              <div className="custom-control custom-checkbox custom-checkbox-secondary mr-2">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  id="c4"
                  checked={adminUsersContainer.isSelected('suspended')}
                  onClick={() => { this.handleClick('suspended') }}
                />
                <label className="custom-control-label" htmlFor="c4">
                  <span className="badge badge-pill badge-secondary d-inline-block vt mt-1">Suspended</span>
                </label>
              </div>

              <div className="custom-control custom-checkbox custom-checkbox-info">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  id="c5"
                  checked={adminUsersContainer.isSelected('invited')}
                  onClick={() => { this.handleClick('invited') }}
                />
                <label className="custom-control-label" htmlFor="c5">
                  <span className="badge badge-pill badge-info d-inline-block vt mt-1">Invited</span>
                </label>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { this.resetButtonClickHandler() }}
              >
                <span
                  className="icon-refresh mr-1"
                >
                </span>
                Reset
              </button>
            </div>

            <div className="ml-5">
              {this.state.isNotifyCommentShow && <span className="text-warning small">{t('admin:user_management.click_twice_same_checkbox')}</span>}
            </div>

          </div>
        </div>


        {pager}
        <UserTable />
        {pager}

      </Fragment>
    );
  }

}


UserManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

const UserManagementWrapper = (props) => {
  return createSubscribedElement(UserManagement, props, [AppContainer, AdminUsersContainer]);
};

export default withTranslation()(UserManagementWrapper);
