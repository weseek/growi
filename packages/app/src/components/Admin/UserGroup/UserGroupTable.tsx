import React, {
  FC, useState, useCallback, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import Xss from '~/services/xss';
import AppContainer from '~/client/services/AppContainer';
import { IUserGroupHasId, IUserGroupRelation, IUserHasId } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';


type Props = {
  appContainer: AppContainer,

  userGroups: IUserGroupHasId[],
  userGroupRelations: IUserGroupRelation[],
  childUserGroups: IUserGroupHasId[],
  isAclEnabled: boolean,
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


const UserGroupTable: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;
  const { t } = useTranslation();

  /*
   * State
   */
  const [groupIdToUsersMap, setGroupIdToUsersMap] = useState(generateGroupIdToUsersMap(props.userGroupRelations));
  const [groupIdToChildGroupsMap, setGroupIdToChildGroupsMap] = useState(generateGroupIdToChildGroupsMap(props.childUserGroups));

  /*
   * Function
   */
  const onClickDelete = useCallback((e) => { // no preventDefault
    if (props.onDelete == null) {
      return;
    }

    const groupId = e.target.getAttribute('data-user-group-id');
    const group = props.userGroups.find((group) => {
      return group._id === groupId;
    });

    if (group == null) {
      return;
    }

    props.onDelete(group);
  }, [props.userGroups, props.onDelete]);

  /*
   * useEffect
   */
  useEffect(() => {
    setGroupIdToUsersMap(generateGroupIdToUsersMap(props.userGroupRelations));
    setGroupIdToChildGroupsMap(generateGroupIdToChildGroupsMap(props.childUserGroups));
  }, [props.userGroupRelations, props.childUserGroups]);

  return (
    <>
      <h2>{t('admin:user_group_management.group_list')}</h2>

      <table className="table table-bordered table-user-list">
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Description')}</th>
            <th>{t('User')}</th>
            <th>{t('Child groups')}</th>
            <th width="100px">{t('Created')}</th>
            <th width="70px"></th>
          </tr>
        </thead>
        <tbody>
          {props.userGroups.map((group) => {
            const users = groupIdToUsersMap[group._id];

            return (
              <tr key={group._id}>
                {props.isAclEnabled
                  ? (
                    <td><a href={`/admin/user-group-detail/${group._id}`}>{xss.process(group.name)}</a></td>
                  )
                  : (
                    <td>{xss.process(group.name)}</td>
                  )
                }
                <td>{xss.process(group.description)}</td>
                <td>
                  <ul className="list-inline">
                    {users != null && users.map((user) => {
                      return <li key={user._id} className="list-inline-item badge badge-pill badge-warning">{xss.process(user.username)}</li>;
                    })}
                  </ul>
                </td>
                <td>
                  <ul className="list-inline">
                    {groupIdToChildGroupsMap[group._id].map((group) => {
                      return (
                        <li key={group._id} className="list-inline-item badge badge-pill badge-warning">
                          {props.isAclEnabled
                            ? (
                              <td><a href={`/admin/user-group-detail/${group._id}`}>{xss.process(group.name)}</a></td>
                            )
                            : (
                              <td>{xss.process(group.name)}</td>
                            )
                          },&nbsp;
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
                          <a className="dropdown-item" href={`/admin/user-group-detail/${group._id}`}>
                            <i className="icon-fw icon-note"></i> {t('Edit')}
                          </a>
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
    </>
  );
};

export default UserGroupTable;
