import { FC, useCallback, useState } from 'react';

import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'react-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { IExternalUserGroupHasId } from '~/interfaces/external-user-group';

type Props = {
  externalUserGroup: IExternalUserGroupHasId,
  parent?: IExternalUserGroupHasId,
};

export const ExternalUserGroupEditForm: FC<Props> = ({ externalUserGroup, parent }: Props) => {
  const { t } = useTranslation('admin');

  const [currentDescription, setDescription] = useState(externalUserGroup != null ? externalUserGroup.description : '');

  const onSubmit = useCallback(async(e): Promise<void> => {
    e.preventDefault();
    try {
      await apiv3Put(`/external-user-groups/${externalUserGroup._id}`, {
        description: currentDescription,
      });
      toastSuccess(t('toaster.update_successed', { target: t('ExternalUserGroup'), ns: 'commons' }));
    }
    catch {
      toastError(t('toaster.update_failed', { target: t('ExternalUserGroup'), ns: 'commons' }));
    }
  }, [t, currentDescription, externalUserGroup._id]);

  return <form onSubmit={onSubmit}
  >

    <fieldset>
      <h2 className="admin-setting-header">{t('user_group_management.basic_info')}</h2>

      {
        externalUserGroup?.createdAt != null && (
          <div className="form-group row">
            <p className="col-md-2 col-form-label">{t('Created')}</p>
            <p className="col-md-4 my-auto">{dateFnsFormat(new Date(externalUserGroup.createdAt), 'yyyy-MM-dd')}</p>
          </div>
        )
      }

      <div className="form-group row">
        <label htmlFor="name" className="col-md-2 col-form-label">
          {t('user_group_management.group_name')}
        </label>
        <div className="col-md-4 my-auto">
          {externalUserGroup.name}
        </div>
      </div>

      <div className="form-group row">
        <label htmlFor="description" className="col-md-2 col-form-label">
          {t('Description')}
        </label>
        <div className="col-md-4">
          <textarea className="form-control" name="description" value={currentDescription} onChange={(e) => {
            setDescription(e.target.value);
          }} />
        </div>
      </div>

      <div className="form-group row">
        <label htmlFor="parent" className="col-md-2 col-form-label">
          {t('user_group_management.parent_group')}
        </label>
        <div className="col-md-4 my-auto">
          {parent?.name}
        </div>
      </div>

      <div className="form-group row">
        <div className="offset-md-2 col-md-10">
          <button type="submit" className="btn btn-primary">
            {t('Update')}
          </button>
        </div>
      </div>
    </fieldset>
  </form>;
};
