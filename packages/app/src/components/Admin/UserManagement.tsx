import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastError } from '~/client/util/toastr';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';

import InviteUserControl from './Users/InviteUserControl';
import PasswordResetModal from './Users/PasswordResetModal';
import UserTable from './Users/UserTable';

import styles from './UserManagement.module.scss';

type UserManagementProps = {
  adminUsersContainer: AdminUsersContainer
}

const UserManagement = (props: UserManagementProps) => {

  const { t } = useTranslation('admin');
  const { adminUsersContainer } = props;
  const [isNotifyCommentShow, setIsNotifyCommentShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pagingHandler = useCallback(async(selectedPage: number) => {
    try {
      await adminUsersContainer.retrieveUsersByPagingNum(selectedPage);
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer]);

  // for Next routing
  useEffect(() => {
    pagingHandler(1);
  }, [pagingHandler]);

  const validateToggleStatus = (statusType: string) => {
    return (adminUsersContainer.isSelected(statusType)) ? (
      adminUsersContainer.state.selectedStatusList.size > 1
    )
      : (
        true
      );
  };

  const clickHandler = (statusType: string) => {
    if (!validateToggleStatus(statusType)) {
      return setIsNotifyCommentShow(true);
    }

    if (isNotifyCommentShow) {
      setIsNotifyCommentShow(false);
    }
    adminUsersContainer.handleClick(statusType);
  };

  const resetButtonClickHandler = useCallback(async() => {
    try {
      await adminUsersContainer.resetAllChanges();
      setIsNotifyCommentShow(false);
      if (inputRef.current != null) {
        inputRef.current.value = '';
      }
    }
    catch (err) {
      toastError(err);
    }
  }, [adminUsersContainer]);

  const changeSearchTextHandler = useCallback(async(e: React.FormEvent<HTMLInputElement>) => {
    await adminUsersContainer.handleChangeSearchText(e?.currentTarget.value);
  }, [adminUsersContainer]);

  const renderCheckbox = (status: string, statusLabel: string, statusColor: string) => {
    return (
      <div className={`custom-control custom-checkbox custom-checkbox-${statusColor} mr-2`}>
        <input
          className="custom-control-input"
          type="checkbox"
          id={`c_${status}`}
          checked={adminUsersContainer.isSelected(status)}
          onChange={() => clickHandler(status)}
        />
        <label className="custom-control-label" htmlFor={`c_${status}`}>
          <span className={`badge badge-pill badge-${statusColor} d-inline-block vt mt-1`}>
            {statusLabel}
          </span>
        </label>
      </div>
    );
  };

  const pager = (
    <div className="my-3">
      <PaginationWrapper
        activePage={adminUsersContainer.state.activePage}
        changePage={pagingHandler}
        totalItemsCount={adminUsersContainer.state.totalUsers}
        pagingLimit={adminUsersContainer.state.pagingLimit}
        align="center"
        size="sm"
      />
    </div>
  );

  return (
    <div data-testid="admin-users">
      { adminUsersContainer.state.userForPasswordResetModal != null
      && (
        <PasswordResetModal
          isOpen={adminUsersContainer.state.isPasswordResetModalShown}
          onClose={adminUsersContainer.hidePasswordResetModal}
          userForPasswordResetModal={adminUsersContainer.state.userForPasswordResetModal}
        />
      ) }
      <p>
        <InviteUserControl />
        <Link
          href="/admin/users/external-accounts"
          className="btn btn-outline-secondary ml-2"
          role="button"
        >
          <i className="icon-user-follow mr-1" aria-hidden="true"></i>
          {t('admin:user_management.external_account')}
        </Link>
      </p>

      <h2>{t('user_management.user_management')}</h2>
      <div className="border-top border-bottom">

        <div className="row d-flex justify-content-start align-items-center my-2">
          <div className="col-md-3 d-flex align-items-center my-2">
            <i className="icon-magnifier mr-1"></i>
            <span className={`search-typeahead ${styles['search-typeahead']}`}>
              <input
                className="w-100"
                type="text"
                ref={inputRef}
                onChange={changeSearchTextHandler}
              />
              {
                adminUsersContainer.state.searchText.length > 0
                  ? (
                    <i
                      className="icon-close search-clear"
                      onClick={async() => {
                        await adminUsersContainer.clearSearchText();
                        if (inputRef.current != null) {
                          inputRef.current.value = '';
                        }
                      }}
                    />
                  )
                  : ''
              }
            </span>
          </div>

          <div className="offset-md-1 col-md-6 my-2">
            <div className="form-inline">
              {renderCheckbox('all', 'All', 'secondary')}
              {renderCheckbox('registered', 'Approval Pending', 'info')}
              {renderCheckbox('active', 'Active', 'success')}
              {renderCheckbox('suspended', 'Suspended', 'warning')}
              {renderCheckbox('invited', 'Invited', 'pink')}
            </div>
            <div>
              { isNotifyCommentShow && <span className="text-warning">{t('admin:user_management.click_twice_same_checkbox')}</span> }
            </div>
          </div>

          <div className="col-md-2 my-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={resetButtonClickHandler}
            >
              <span className="icon-refresh mr-1"></span>
              {t('commons:Reset')}
            </button>
          </div>
        </div>
      </div>

      {pager}
      <UserTable />
      {pager}

    </div>
  );

};

const UserManagementWrapper = withUnstatedContainers(UserManagement, [AdminUsersContainer]);

export default UserManagementWrapper;
