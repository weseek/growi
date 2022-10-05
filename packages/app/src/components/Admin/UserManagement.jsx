import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastError } from '~/client/util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';


import InviteUserControl from './Users/InviteUserControl';
import PasswordResetModal from './Users/PasswordResetModal';
import UserTable from './Users/UserTable';

import styles from './UserManagement.module.scss';

class UserManagement extends React.Component {

  constructor(props) {
    super();

    this.state = {
      isNotifyCommentShow: false,
    };

    this.handlePage = this.handlePage.bind(this);
    this.handleChangeSearchText = this.handleChangeSearchText.bind(this);
  }

  UNSAFE_componentWillMount() {
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
      this.setState({ isNotifyCommentShow: false });
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

  renderCheckbox(status, statusLabel, statusColor) {
    return (
      <div className={`custom-control custom-checkbox custom-checkbox-${statusColor} mr-2`}>
        <input
          className="custom-control-input"
          type="checkbox"
          id={`c_${status}`}
          checked={this.props.adminUsersContainer.isSelected(status)}
          onChange={() => { this.handleClick(status) }}
        />
        <label className="custom-control-label" htmlFor={`c_${status}`}>
          <span className={`badge badge-pill badge-${statusColor} d-inline-block vt mt-1`}>
            {statusLabel}
          </span>
        </label>
      </div>
    );
  }

  render() {
    const { t, adminUsersContainer } = this.props;

    const pager = (
      <div className="my-3">
        <PaginationWrapper
          activePage={adminUsersContainer.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={adminUsersContainer.state.totalUsers}
          pagingLimit={adminUsersContainer.state.pagingLimit}
          align="center"
          size="sm"
        />
      </div>
    );

    const clearButton = (
      adminUsersContainer.state.searchText.length > 0
        ? (
          <i
            className={`icon-close ${styles['search-clear']}`}
            onClick={() => {
              adminUsersContainer.clearSearchText();
              this.searchUserElement.value = '';
            }}
          />
        )
        : ''
    );

    return (
      <div data-testid="admin-users">
        {adminUsersContainer.state.userForPasswordResetModal != null
        && (
          <PasswordResetModal
            isOpen={adminUsersContainer.state.isPasswordResetModalShown}
            onClose={adminUsersContainer.hidePasswordResetModal}
            userForPasswordResetModal={adminUsersContainer.state.userForPasswordResetModal}
          />
        )}
        <p>
          <InviteUserControl />
          <a className="btn btn-outline-secondary ml-2" href="/admin/users/external-accounts" role="button">
            <i className="icon-user-follow" aria-hidden="true"></i>
            {t('admin:user_management.external_account')}
          </a>
        </p>

        <h2>{t('user_management.user_management')}</h2>
        <div className="border-top border-bottom">

          <div className="row d-flex justify-content-start align-items-center my-2">
            <div className="col-md-3 d-flex align-items-center my-2">
              <i className="icon-magnifier mr-1"></i>
              <span className="search-typeahead">
                <input
                  className="w-100"
                  type="text"
                  ref={(searchUserElement) => { this.searchUserElement = searchUserElement }}
                  onChange={this.handleChangeSearchText}
                />
                { clearButton }
              </span>
            </div>

            <div className="offset-md-1 col-md-6 my-2">
              <div className="form-inline">
                {this.renderCheckbox('all', 'All', 'secondary')}
                {this.renderCheckbox('registered', 'Approval Pending', 'info')}
                {this.renderCheckbox('active', 'Active', 'success')}
                {this.renderCheckbox('suspended', 'Suspended', 'warning')}
                {this.renderCheckbox('invited', 'Invited', 'pink')}
              </div>
              <div>
                {
                  this.state.isNotifyCommentShow
                  && <span className="text-warning">{t('admin:user_management.click_twice_same_checkbox')}</span>
                }
              </div>
            </div>

            <div className="col-md-2 my-2">
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
          </div>
        </div>


        {pager}
        <UserTable />
        {pager}

      </div>
    );
  }

}


UserManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminUsersContainer: PropTypes.instanceOf(AdminUsersContainer).isRequired,
};

const UserManagementFc = (props) => {
  const { t } = useTranslation('admin');
  return <UserManagement t={t} {...props} />;
};

const UserManagementWrapper = withUnstatedContainers(UserManagementFc, [AdminUsersContainer]);

export default UserManagementWrapper;
