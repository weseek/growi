import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';
import { TFunctionResult } from 'i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';
import Xss from '~/services/xss';

type Props = {
  userGroup?: IUserGroupHasId,
  successedMessage: TFunctionResult;
  failedMessage: TFunctionResult;
  submitButtonLabel: TFunctionResult;
  onSubmit?: (userGroupData: Partial<IUserGroup>) => Promise<IUserGroupHasId | void>
};

const UserGroupForm: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;

  const { t } = useTranslation();

  /*
   * State
   */
  const [currentName, setName] = useState(props.userGroup != null ? props.userGroup.name : '');
  const [currentDescription, setDescription] = useState(props.userGroup != null ? props.userGroup.description : '');
  const [currentParent, setParent] = useState(props.userGroup != null ? props.userGroup.parent : '');

  /*
   * Function
   */
  const onChangeNameHandler = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onChangeDescriptionHandler = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const onSubmitHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (props.onSubmit == null) {
      return;
    }

    try {
      await props.onSubmit({ name: currentName, description: currentDescription, parent: currentParent });

      toastSuccess(props.successedMessage);
    }
    catch (err) {
      toastError(props.failedMessage);
    }
  }, [currentName, currentDescription, currentParent, props.onSubmit, props.successedMessage, props.failedMessage]);

  return (
    <form onSubmit={onSubmitHandler}>
      {/* TODO 85062: improve style */}
      {
        props.userGroup != null && (
          <div className="row mb-2">
            <p className="col-md-4">{t('Created')}</p>
            <p className="col">{dateFnsFormat(new Date(props.userGroup.createdAt), 'yyyy-MM-dd')}</p>
          </div>
        )
      }

      <fieldset>
        <h2 className="admin-setting-header">{t('admin:user_group_management.basic_info')}</h2>
        <div className="form-group row">
          <label htmlFor="name" className="col-md-2 col-form-label">
            {t('admin:user_group_management.group_name')}
          </label>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder={t('admin:user_group_management.group_example')}
              value={currentName}
              onChange={onChangeNameHandler}
              required
            />
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="description" className="col-md-2 col-form-label">
            {t('Description')}
          </label>
          <div className="col-md-4">
            <textarea className="form-control" name="description" value={currentDescription} onChange={onChangeDescriptionHandler} required />
          </div>
        </div>

        {/* TODO 85062: select parent dropdown */}

        <div className="form-group row">
          <div className="offset-md-2 col-md-10">
            <button type="submit" className="btn btn-primary">
              {props.submitButtonLabel}
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
const UserGroupFormWrapper = withUnstatedContainers<unknown, Props>(UserGroupForm, [AppContainer]);

export default UserGroupFormWrapper;
