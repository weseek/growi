import {
  FC, useCallback, useMemo, useState,
} from 'react';

import { useTranslation } from 'react-i18next';
import { TabContent, TabPane } from 'reactstrap';

import { apiv3Delete, apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { UserGroupDeleteModal } from '~/components/Admin/UserGroup/UserGroupDeleteModal';
import { UserGroupModal } from '~/components/Admin/UserGroup/UserGroupModal';
import { UserGroupTable } from '~/components/Admin/UserGroup/UserGroupTable';
import CustomNav from '~/components/CustomNavigation/CustomNav';
import { IExternalUserGroupHasId } from '~/features/external-user-group/interfaces/external-user-group';
import { useIsAclEnabled } from '~/stores/context';

import { useSWRxChildExternalUserGroupList, useSWRxExternalUserGroupList, useSWRxExternalUserGroupRelationList } from '../../stores/external-user-group';

import { KeycloakGroupManagement } from './KeycloakGroupManagement';
import { LdapGroupManagement } from './LdapGroupManagement';

export const ExternalGroupManagement: FC = () => {
  const { data: externalUserGroupList, mutate: mutateExternalUserGroups } = useSWRxExternalUserGroupList();
  const externalUserGroups = externalUserGroupList != null ? externalUserGroupList : [];
  const externalUserGroupIds = externalUserGroups.map(group => group._id);

  const { data: externalUserGroupRelationList } = useSWRxExternalUserGroupRelationList(externalUserGroupIds);
  const externalUserGroupRelations = externalUserGroupRelationList != null ? externalUserGroupRelationList : [];

  const { data: childExternalUserGroupsList } = useSWRxChildExternalUserGroupList(externalUserGroupIds);
  const childExternalUserGroups = childExternalUserGroupsList?.childUserGroups != null ? childExternalUserGroupsList.childUserGroups : [];

  const { data: isAclEnabled } = useIsAclEnabled();

  const [activeTab, setActiveTab] = useState('ldap');
  const [activeComponents, setActiveComponents] = useState(new Set(['ldap']));
  const [selectedExternalUserGroup, setSelectedExternalUserGroup] = useState<IExternalUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isUpdateModalShown, setUpdateModalShown] = useState<boolean>(false);
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  const { t } = useTranslation('admin');

  const showUpdateModal = useCallback((group: IExternalUserGroupHasId) => {
    setUpdateModalShown(true);
    setSelectedExternalUserGroup(group);
  }, [setUpdateModalShown]);

  const hideUpdateModal = useCallback(() => {
    setUpdateModalShown(false);
    setSelectedExternalUserGroup(undefined);
  }, [setUpdateModalShown]);

  const syncUserGroupAndRelations = useCallback(async() => {
    try {
      await mutateExternalUserGroups();
    }
    catch (err) {
      toastError(err);
    }
  }, [mutateExternalUserGroups]);

  const showDeleteModal = useCallback(async(group: IExternalUserGroupHasId) => {
    try {
      await syncUserGroupAndRelations();

      setSelectedExternalUserGroup(group);
      setDeleteModalShown(true);
    }
    catch (err) {
      toastError(err);
    }
  }, [syncUserGroupAndRelations]);

  const hideDeleteModal = useCallback(() => {
    setSelectedExternalUserGroup(undefined);
    setDeleteModalShown(false);
  }, []);

  const updateExternalUserGroup = useCallback(async(userGroupData: IExternalUserGroupHasId) => {
    try {
      await apiv3Put(`/external-user-groups/${userGroupData._id}`, {
        description: userGroupData.description,
      });

      toastSuccess(t('toaster.update_successed', { target: t('ExternalUserGroup'), ns: 'commons' }));

      await mutateExternalUserGroups();

      hideUpdateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateExternalUserGroups, hideUpdateModal]);

  const deleteExternalUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      await apiv3Delete(`/external-user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      // sync
      await mutateExternalUserGroups();

      hideDeleteModal();

      toastSuccess(`Deleted ${selectedExternalUserGroup?.name} group.`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the groups'));
    }
  }, [mutateExternalUserGroups, selectedExternalUserGroup, hideDeleteModal]);

  const switchActiveTab = (selectedTab) => {
    setActiveTab(selectedTab);
    setActiveComponents(activeComponents.add(selectedTab));
  };

  const navTabMapping = useMemo(() => {
    return {
      ldap: {
        Icon: () => <i className="fa fa-sitemap" />,
        i18n: 'LDAP',
      },
      keycloak: {
        Icon: () => <i className="fa fa-key" />,
        i18n: 'Keycloak',
      },
    };
  }, []);

  return (
    <>
      <h2 className="border-bottom">{t('external_user_group.management')}</h2>
      <UserGroupTable
        headerLabel={t('admin:user_group_management.group_list')}
        userGroups={externalUserGroups}
        childUserGroups={childExternalUserGroups}
        isAclEnabled={isAclEnabled ?? false}
        onEdit={showUpdateModal}
        onDelete={showDeleteModal}
        userGroupRelations={externalUserGroupRelations}
        isExternalGroup
      />

      <UserGroupModal
        userGroup={selectedExternalUserGroup}
        buttonLabel={t('Update')}
        onClickSubmit={updateExternalUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
        isExternalGroup
      />

      <UserGroupDeleteModal
        userGroups={externalUserGroups}
        deleteUserGroup={selectedExternalUserGroup}
        onDelete={deleteExternalUserGroupById}
        isShow={isDeleteModalShown}
        onHide={hideDeleteModal}
      />

      <CustomNav
        activeTab={activeTab}
        navTabMapping={navTabMapping}
        onNavSelected={switchActiveTab}
        hideBorderBottom
        breakpointToSwitchDropdownDown="md"
      />
      <TabContent activeTab={activeTab} className="p-5">
        <TabPane tabId="ldap">
          {activeComponents.has('ldap') && <LdapGroupManagement />}
        </TabPane>
        <TabPane tabId="keycloak">
          {activeComponents.has('keycloak') && <KeycloakGroupManagement />}
        </TabPane>
      </TabContent>
    </>
  );
};
