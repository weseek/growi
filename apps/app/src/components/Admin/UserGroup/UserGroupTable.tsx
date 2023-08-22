import React, {
  FC, useState, useEffect,
} from 'react';

import type { IUserGroupHasId, IUserGroupRelation, IUserHasId } from '@growi/core';
import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';


type Props = {
  headerLabel?: string,
  userGroups: IUserGroupHasId[],
  userGroupRelations: IUserGroupRelation[],
  childUserGroups: IUserGroupHasId[],
  isAclEnabled: boolean,
  onEdit?: (userGroup: IUserGroupHasId) => void | Promise<void>,
  onRemove?: (userGroup: IUserGroupHasId) => void | Promise<void>,
  onDelete?: (userGroup: IUserGroupHasId) => void | Promise<void>,
};

/*
 * Utility
 */
const generateGroupIdToUsersMap = (userGroupRelations: IUserGroupRelation[]): Record<string, Partial<IUserHasId>[]> => {
  const userGroupMap = {};
  userGroupRelations.forEach((relation) => {
    const group = relation.relatedGroup as string; // must be an id of related group

    const users: Partial<IUserHasId>[] = userGroupMap[group] || [];
    users.push(relation.relatedUser as IUserHasId);

    // register
    userGroupMap[group] = users;
  });

  return userGroupMap;
};

const generateGroupIdToChildGroupsMap = (childUserGroups: IUserGroupHasId[]): Record<string, IUserGroupHasId[]> => {
  const map = {};
  childUserGroups.forEach((group) => {
    const parentId = group.parent as string; // must be an id

    const groups: Partial<IUserGroupHasId>[] = map[parentId] || [];
    groups.push(group);

    // register
    map[parentId] = groups;
  });

  return map;
};


export const UserGroupTable: FC<Props> = (props: Props) => {
  const { t } = useTranslation('admin');

  /*
   * State
   */
  const [groupIdToUsersMap, setGroupIdToUsersMap] = useState(generateGroupIdToUsersMap(props.userGroupRelations));
  const [groupIdToChildGroupsMap, setGroupIdToChildGroupsMap] = useState(generateGroupIdToChildGroupsMap(props.childUserGroups));

  /*
   * Function
   */
  const findUserGroup = (e: React.ChangeEvent<HTMLInputElement>): IUserGroupHasId | undefined => {
    const groupId = e.target.getAttribute('data-user-group-id');
    return props.userGroups.find((group) => {
      return group._id === groupId;
    });
  };

  const onClickEdit = async(e) => {
    if (props.onEdit == null) {
      return;
    }

    const userGroup = findUserGroup(e);
    if (userGroup == null) {
      return;
    }

    props.onEdit(userGroup);
  };

  const onClickRemove = async(e) => {
    if (props.onRemove == null) {
      return;
    }

    const userGroup = findUserGroup(e);
    if (userGroup == null) {
      return;
    }

    try {
      await props.onRemove(userGroup);
      userGroup.parent = null;
    }
    catch {
      //
    }
  };

  const onClickDelete = (e) => { // no preventDefault
    if (props.onDelete == null) {
      return;
    }

    const userGroup = findUserGroup(e);
    if (userGroup == null) {
      return;
    }

    props.onDelete(userGroup);
  };

  /*
   * useEffect
   */
  useEffect(() => {
    setGroupIdToUsersMap(generateGroupIdToUsersMap(props.userGroupRelations));
    setGroupIdToChildGroupsMap(generateGroupIdToChildGroupsMap(props.childUserGroups));
  }, [props.userGroupRelations, props.childUserGroups]);

  return (
    <div data-testid="grw-user-group-table">
      <h2>{props.headerLabel}</h2>

      <table className="table table-bordered table-user-list">
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Description')}</th>
            <th>{t('User')}</th>
            <th>{t('user_group_management.child_user_group')}</th>
            <th style={{ width: 100 }}>{t('Created')}</th>
            <th style={{ width: 70 }}></th>
          </tr>
        </thead>
        <tbody>
          {props.userGroups.map((group) => {
            const users = groupIdToUsersMap[group._id];

            return (
              <tr key={group._id}>
                {props.isAclEnabled
                  ? (
                    <td><Link href={`/admin/user-group-detail/${group._id}`}>{group.name}</Link></td>
                  )
                  : (
                    <td>{group.name}</td>
                  )
                }
                <td>{group.description}</td>
                <td>
                  <ul className="list-inline">
                    {users != null && users.map((user) => {
                      return <li key={user._id} className="list-inline-item badge rounded-pill badge-warning">{user.username}</li>;
                    })}
                  </ul>
                </td>
                <td>
                  <ul className="list-inline">
                    {groupIdToChildGroupsMap[group._id] != null && groupIdToChildGroupsMap[group._id].map((group) => {
                      return (
                        <li key={group._id} className="list-inline-item badge badge-success">
                          {props.isAclEnabled
                            ? (
                              <Link href={`/admin/user-group-detail/${group._id}`}>{group.name}</Link>
                            )
                            : (
                              <p>{group.name}</p>
                            )
                          }
                        </li>
                      );
                    })}
                  </ul>
                </td>
                <td>{dateFnsFormat(new Date(group.createdAt), 'yyyy-MM-dd')}</td>
                {props.isAclEnabled
                  ? (
                    <td>
                      <div className="btn-group admin-group-menu">
                        <button
                          type="button"
                          id={`admin-group-menu-button-${group._id}`}
                          className="btn btn-outline-secondary btn-sm dropdown-toggle"
                          data-toggle="dropdown"
                        >
                          <i className="icon-settings"></i>
                        </button>
                        <div className="dropdown-menu" role="menu" aria-labelledby={`admin-group-menu-button-${group._id}`}>
                          <button className="dropdown-item" type="button" role="button" onClick={onClickEdit} data-user-group-id={group._id}>
                            <i className="icon-fw icon-note"></i> {t('Edit')}
                          </button>
                          <button className="dropdown-item" type="button" role="button" onClick={onClickRemove} data-user-group-id={group._id}>
                            <i className="icon-fw fa fa-chain-broken"></i> {t('admin:user_group_management.remove_child_group')}
                          </button>
                          <button className="dropdown-item" type="button" role="button" onClick={onClickDelete} data-user-group-id={group._id}>
                            <i className="icon-fw icon-fire text-danger"></i> {t('Delete')}
                          </button>
                        </div>
                      </div>
                    </td>
                  )
                  : (
                    <td></td>
                  )
                }
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
