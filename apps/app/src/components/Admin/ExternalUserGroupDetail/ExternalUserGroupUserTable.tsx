import React from 'react';

import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';

import type { IUserGroupRelationHasIdPopulatedUser } from '~/interfaces/user-group-response';

type Props = {
  externalUserGroupRelations: IUserGroupRelationHasIdPopulatedUser[] | undefined,
}

export const ExternalUserGroupUserTable = ({
  externalUserGroupRelations,
}: Props): JSX.Element => {
  const { t } = useTranslation('admin');

  return (
    <table className="table table-bordered table-user-list">
      <thead>
        <tr>
          <th style={{ width: '100px' }}>#</th>
          <th>
            {t('username')}
          </th>
          <th>{t('Name')}</th>
          <th style={{ width: '100px' }}>{t('Created')}</th>
          <th style={{ width: '160px' }}>{t('last_login')}</th>
        </tr>
      </thead>
      <tbody>
        {externalUserGroupRelations != null && externalUserGroupRelations.map((relation) => {
          const { relatedUser } = relation;

          return (
            <tr key={relation._id}>
              <td>
                <UserPicture user={relatedUser} />
              </td>
              <td>
                <strong>{relatedUser.username}</strong>
              </td>
              <td>{relatedUser.name}</td>
              <td>{relatedUser.createdAt ? dateFnsFormat(new Date(relatedUser.createdAt), 'yyyy-MM-dd') : ''}</td>
              <td>{relatedUser.lastLoginAt ? dateFnsFormat(new Date(relatedUser.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : ''}</td>
            </tr>
          );
        })}

      </tbody>
    </table>
  );
};
