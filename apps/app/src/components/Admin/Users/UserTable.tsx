import React, { useCallback } from 'react';

import type { IUserHasId } from '@growi/core/dist/interfaces';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

import { SortIcons } from './SortIcons';
import UserMenu from './UserMenu';

type UserTableProps = {
  adminUsersContainer: AdminUsersContainer,
}

const UserTable = (props: UserTableProps) => {

  const { t } = useTranslation('admin');
  const { adminUsersContainer } = props;

  const getUserStatusLabel = (userStatus: number) => {
    let additionalClassName = 'badge-info';
    let text = 'Approval Pending';

    switch (userStatus) {
      case 1:
        additionalClassName = 'badge-info';
        text = 'Approval Pending';
        break;
      case 2:
        additionalClassName = 'badge-success';
        text = 'Active';
        break;
      case 3:
        additionalClassName = 'badge-warning';
        text = 'Suspended';
        break;
      case 4:
        additionalClassName = 'badge-danger';
        text = 'Deleted';
        break;
      case 5:
        additionalClassName = 'badge-pink';
        text = 'Invited';
        break;
    }

    return (
      <span className={`badge badge-pill ${additionalClassName}`}>
        {text}
      </span>
    );
  };

  const sortIconsClickedHandler = useCallback(async(sort: string, sortOrder: string) => {
    const isAsc = sortOrder === 'asc';
    await adminUsersContainer.sort(sort, isAsc);
  }, [adminUsersContainer]);

  const isCurrentSortOrderAsc = adminUsersContainer.state.sortOrder === 'asc';

  return (
    <div className="table-responsive text-nowrap h-100">
      <table className="table table-default table-bordered table-user-list">
        <thead>
          <tr>
            <th style={{ width: '100px' }}>#</th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('user_management.status')}
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'status'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('status', sortOrder)}
                />
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  <code>username</code>
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'username'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('username', sortOrder)}
                />
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Name')}
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'name'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('name', sortOrder)}
                />
              </div>
            </th>
            <th>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Email')}
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'email'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('email', sortOrder)}
                />
              </div>
            </th>
            <th style={{ width: '100px' }}>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('Created')}
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'createdAt'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('createdAt', sortOrder)}
                />
              </div>
            </th>
            <th style={{ width: '150px' }}>
              <div className="d-flex align-items-center">
                <div className="mr-3">
                  {t('last_login')}
                </div>
                <SortIcons
                  isSelected={adminUsersContainer.state.sort === 'lastLoginAt'}
                  isAsc={isCurrentSortOrderAsc}
                  onClick={sortOrder => sortIconsClickedHandler('lastLoginAt', sortOrder)}
                />
              </div>
            </th>
            <th style={{ width: '70px' }}></th>
          </tr>
        </thead>
        <tbody>
          { adminUsersContainer.state.users.map((user: IUserHasId) => {
            return (
              <tr data-testid="user-table-tr" key={user._id}>
                <td>
                  <UserPicture user={user} />
                </td>
                <td>
                  {getUserStatusLabel(user.status)}
                  {(user.admin) && (
                    <span className="badge badge-indigo badge-pill ml-2">
                      {t('admin:user_management.user_table.administrator')}
                    </span>
                  )}
                  {(user.readOnly) && (
                    <span className="badge badge-light badge-pill ml-2">
                      {t('admin:user_management.user_table.read_only')}
                    </span>
                  )}
                </td>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{dateFnsFormat(new Date(user.createdAt), 'yyyy-MM-dd')}</td>
                <td>
                  {user.lastLoginAt && <span>{dateFnsFormat(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm')}</span>}
                </td>
                <td>
                  <UserMenu user={user} />
                </td>
              </tr>
            );
          }) }
        </tbody>
      </table>
    </div>
  );

};

const UserTableWrapper = withUnstatedContainers(UserTable, [AdminUsersContainer]);

export default UserTableWrapper;
