import React, {
  useState, useCallback, useEffect,
} from 'react';

import { objectIdUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  apiv3Put, apiv3Delete,
} from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { UserGroupDeleteModal } from '~/components/Admin/UserGroup/UserGroupDeleteModal';
import { UserGroupForm } from '~/components/Admin/UserGroup/UserGroupForm';
import { UserGroupModal } from '~/components/Admin/UserGroup/UserGroupModal';
import { UserGroupTable } from '~/components/Admin/UserGroup/UserGroupTable';
import styles from '~/components/Admin/UserGroupDetail/UserGroupDetailPage.module.scss';
import { UserGroupUserTable } from '~/components/Admin/UserGroupDetail/UserGroupUserTable';
import {
  useSWRxAncestorExternalUserGroups,
  useSWRxChildExternalUserGroupList, useSWRxExternalUserGroup, useSWRxExternalUserGroupRelationList, useSWRxExternalUserGroupRelations,
} from '~/features/external-user-group/client/stores/external-user-group';
import { IExternalUserGroupHasId } from '~/features/external-user-group/interfaces/external-user-group';
import { useIsAclEnabled } from '~/stores/context';

type Props = {
  externalUserGroupId: string,
}

const ExternalUserGroupDetailPage = (props: Props): JSX.Element => {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const { externalUserGroupId: currentExternalUserGroupId } = props;

  const { data: currentExternalUserGroup } = useSWRxExternalUserGroup(currentExternalUserGroupId);
  const [selectedExternalUserGroup, setSelectedExternalUserGroup] = useState<IExternalUserGroupHasId | undefined>(undefined); // not null but undefined (to use defaultProps in UserGroupDeleteModal)
  const [isUpdateModalShown, setUpdateModalShown] = useState<boolean>(false);
  const [isDeleteModalShown, setDeleteModalShown] = useState<boolean>(false);

  const isLoading = currentExternalUserGroup === undefined;
  const notExistsUerGroup = !isLoading && currentExternalUserGroup == null;

  useEffect(() => {
    if (!objectIdUtils.isValidObjectId(currentExternalUserGroupId) || notExistsUerGroup) {
      router.push('/admin/user-groups');
    }
  }, [currentExternalUserGroup, currentExternalUserGroupId, notExistsUerGroup, router]);


  // TODO: fetch pages (https://redmine.weseek.co.jp/issues/124385)
  // const { data: userGroupPages } = useSWRxUserGroupPages(currentExternalUserGroupId, 10, 0);

  const { data: externalUserGroupRelations } = useSWRxExternalUserGroupRelations(currentExternalUserGroupId);

  const { data: childExternalUserGroupsList, mutate: mutateExternalChildUserGroups } = useSWRxChildExternalUserGroupList(
    currentExternalUserGroupId ? [currentExternalUserGroupId] : [], true,
  );
  const childUserGroups = childExternalUserGroupsList != null ? childExternalUserGroupsList.childUserGroups : [];
  const grandChildUserGroups = childExternalUserGroupsList != null ? childExternalUserGroupsList.grandChildUserGroups : [];
  const childUserGroupIds = childUserGroups.map(group => group._id);

  const { data: externalUserGroupRelationList } = useSWRxExternalUserGroupRelationList(childUserGroupIds);
  const childUserGroupRelations = externalUserGroupRelationList != null ? externalUserGroupRelationList : [];

  const { data: ancestorExternalUserGroups } = useSWRxAncestorExternalUserGroups(currentExternalUserGroupId);

  const { data: isAclEnabled } = useIsAclEnabled();

  const showUpdateModal = useCallback((group: IExternalUserGroupHasId) => {
    setUpdateModalShown(true);
    setSelectedExternalUserGroup(group);
  }, [setUpdateModalShown]);

  const hideUpdateModal = useCallback(() => {
    setUpdateModalShown(false);
    setSelectedExternalUserGroup(undefined);
  }, [setUpdateModalShown]);

  const updateChildExternalUserGroup = useCallback(async(userGroupData: IExternalUserGroupHasId) => {
    try {
      await apiv3Put(`/external-user-groups/${userGroupData._id}`, {
        description: userGroupData.description,
      });

      toastSuccess(t('toaster.update_successed', { target: t('UserGroup'), ns: 'commons' }));

      // mutate
      mutateExternalChildUserGroups();

      hideUpdateModal();
    }
    catch (err) {
      toastError(err);
    }
  }, [t, mutateExternalChildUserGroups, hideUpdateModal]);

  const showDeleteModal = useCallback(async(group: IExternalUserGroupHasId) => {
    setSelectedExternalUserGroup(group);
    setDeleteModalShown(true);
  }, [setSelectedExternalUserGroup, setDeleteModalShown]);

  const hideDeleteModal = useCallback(() => {
    setSelectedExternalUserGroup(undefined);
    setDeleteModalShown(false);
  }, [setSelectedExternalUserGroup, setDeleteModalShown]);

  const deleteChildUserGroupById = useCallback(async(deleteGroupId: string, actionName: string, transferToUserGroupId: string) => {
    try {
      const res = await apiv3Delete(`/user-groups/${deleteGroupId}`, {
        actionName,
        transferToUserGroupId,
      });

      // sync
      await mutateExternalChildUserGroups();

      setSelectedExternalUserGroup(undefined);
      setDeleteModalShown(false);

      toastSuccess(`Deleted ${res.data.userGroups.length} groups.`);
    }
    catch (err) {
      toastError(new Error('Unable to delete the groups'));
    }
  }, [mutateExternalChildUserGroups, setSelectedExternalUserGroup, setDeleteModalShown]);

  const onClickSubmitForm = useCallback(async(targetGroup: IExternalUserGroupHasId, userGroupData: IExternalUserGroupHasId) => {
    try {
      await apiv3Put(`/external-user-groups/${targetGroup._id}`, {
        description: userGroupData.description,
      });
      toastSuccess(t('toaster.update_successed', { target: t('ExternalUserGroup'), ns: 'commons' }));
    }
    catch {
      toastError(t('toaster.update_failed', { target: t('ExternalUserGroup'), ns: 'commons' }));
    }
  }, [t]);

  /*
   * Dependencies
   */
  if (currentExternalUserGroup == null || currentExternalUserGroupId == null) {
    return <></>;
  }

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin/user-groups" prefetch={false}>
              {t('user_group_management.group_list')}
            </Link>
          </li>
          {
            ancestorExternalUserGroups != null && ancestorExternalUserGroups.length > 0
            && (ancestorExternalUserGroups.map((ancestorExternalUserGroup: IExternalUserGroupHasId) => (
              <li
                key={ancestorExternalUserGroup._id}
                className={`breadcrumb-item ${ancestorExternalUserGroup._id === currentExternalUserGroupId ? 'active' : ''}`}
                aria-current="page"
              >
                { ancestorExternalUserGroup._id === currentExternalUserGroupId ? (
                  <span>{ancestorExternalUserGroup.name}</span>
                ) : (
                  <Link
                    href={{
                      pathname: `/admin/user-group-detail/${ancestorExternalUserGroup._id}`,
                      query: { isExternalGroup: 'true' },
                    }}
                    prefetch={false}>
                    {ancestorExternalUserGroup.name}
                  </Link>
                ) }
              </li>
            ))
            )
          }
        </ol>
      </nav>

      <div className="mt-4 form-box">
        <UserGroupForm
          userGroup={currentExternalUserGroup}
          parentUserGroup={ancestorExternalUserGroups != null && ancestorExternalUserGroups.length > 1
            ? ancestorExternalUserGroups[ancestorExternalUserGroups.length - 2] : undefined}
          submitButtonLabel={t('Update')}
          onSubmit={onClickSubmitForm}
          isExternalGroup
        />
      </div>
      <h2 className="admin-setting-header mt-4">{t('user_group_management.user_list')}</h2>
      <UserGroupUserTable
        userGroupRelations={externalUserGroupRelations}
        isExternalGroup
      />

      <h2 className="admin-setting-header mt-4">{t('user_group_management.child_group_list')}</h2>

      <UserGroupModal
        userGroup={selectedExternalUserGroup}
        buttonLabel={t('Update')}
        onClickSubmit={updateChildExternalUserGroup}
        isShow={isUpdateModalShown}
        onHide={hideUpdateModal}
        isExternalGroup
      />

      <UserGroupTable
        userGroups={childUserGroups}
        childUserGroups={grandChildUserGroups}
        isAclEnabled={isAclEnabled ?? false}
        onEdit={showUpdateModal}
        onDelete={showDeleteModal}
        userGroupRelations={childUserGroupRelations}
        isExternalGroup
      />

      <UserGroupDeleteModal
        userGroups={childUserGroups}
        deleteUserGroup={selectedExternalUserGroup}
        onDelete={deleteChildUserGroupById}
        isShow={isDeleteModalShown}
        onHide={hideDeleteModal}
      />

      {/* show user group pages (https://redmine.weseek.co.jp/issues/124385) */}
      {/* <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
      <div className={`page-list ${styles['page-list']}`}>
        <UserGroupPageList userGroupId={currentExternalUserGroupId} relatedPages={userGroupPages} />
      </div> */}
    </div>
  );
};

export default ExternalUserGroupDetailPage;
