import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';
import Xss from '~/services/xss';

type Props = {
  userGroup: IUserGroupHasId,
  onSubmit?: (userGroupData: Partial<IUserGroup>) => Promise<IUserGroupHasId>
};

const UserGroupForm: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;
  const { t } = useTranslation();

  /*
   * State
   */
  const [currentName, setName] = useState(props.userGroup.name);
  const [nameCache, setNameCache] = useState(props.userGroup.name); // to validate the same name

  /*
   * Function
   */
  const onChangeNameHandler = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onSubmitHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (props.onSubmit == null) {
      return;
    }

    try {
      const newUserGroup = await props.onSubmit({ name: currentName });

      toastSuccess(`Updated the group name to "${xss.process(newUserGroup.name)}"`);
      setNameCache(currentName);
    }
    catch (err) {
      toastError(new Error('Unable to update the group name'));
    }
  }, [currentName, props.onSubmit]);

  const validateForm = useCallback(() => { return currentName !== nameCache && currentName !== '' }, [currentName, nameCache]);


  return (
    <form onSubmit={onSubmitHandler}>
      <fieldset>
        <h2 className="admin-setting-header">{t('admin:user_group_management.basic_info')}</h2>
        <div className="form-group row">
          <label htmlFor="name" className="col-md-2 col-form-label">
            {t('Name')}
          </label>
          <div className="col-md-4">
            <input className="form-control" type="text" name="name" value={currentName} onChange={onChangeNameHandler} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-md-2 col-form-label">{t('Created')}</label>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              value={dateFnsFormat(new Date(props.userGroup.createdAt), 'yyyy-MM-dd')}
              disabled
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="offset-md-2 col-md-10">
            <button type="submit" className="btn btn-primary" disabled={!validateForm()}>
              {t('Update')}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
};

/**
 * Wrapper component for using unstated
 */
const UserGroupFormWrapper = withUnstatedContainers(UserGroupForm, [AppContainer]);

export default UserGroupFormWrapper;
