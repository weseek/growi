import React, {
  FC, useCallback, useState, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import dateFnsFormat from 'date-fns/format';
import { TFunctionResult } from 'i18next';

import { useSWRxUserGroup } from '~/stores/user-group';
import { IUserGroup, IUserGroupHasId } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';
import Xss from '~/services/xss';

type Props = {
  userGroup?: IUserGroupHasId,
  parentUserGroups?: IUserGroupHasId[],
  submitButtonLabel: TFunctionResult;
  onSubmit?: (userGroupData: Partial<IUserGroup>) => Promise<IUserGroupHasId | void>
};

const UserGroupForm: FC<Props> = (props: Props) => {
  const xss: Xss = (window as CustomWindow).xss;

  const { t } = useTranslation();

  const {
    userGroup, parentUserGroups, submitButtonLabel, onSubmit,
  } = props;

  /*
   * State
   */
  const [currentName, setName] = useState(userGroup != null ? userGroup.name : '');
  const [currentDescription, setDescription] = useState(userGroup != null ? userGroup.description : '');
  const [selectedParent, setSelectedSelectedParent] = useState<IUserGroupHasId | null>(null);

  /*
   * Fetch
   */
  const { data: parentUserGroup } = useSWRxUserGroup(userGroup?.parent as string);

  /*
   * Function
   */
  const onChangeNameHandler = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onChangeDescriptionHandler = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const onChangeParerentButtonHandler = useCallback((userGroup: IUserGroupHasId) => {
    if (userGroup._id !== selectedParent?._id) {
      setSelectedSelectedParent(userGroup);
    }
  }, [selectedParent, setSelectedSelectedParent]);

  const onSubmitHandler = useCallback(async(e) => {
    e.preventDefault(); // no reload

    if (onSubmit == null) {
      return;
    }

    await onSubmit({ name: currentName, description: currentDescription, parent: selectedParent?._id });
  }, [currentName, currentDescription, selectedParent, onSubmit]);

  useEffect(() => {
    setSelectedSelectedParent(parentUserGroup ?? null);
  }, [parentUserGroup]);

  return (
    <form onSubmit={onSubmitHandler}>

      <fieldset>
        <h2 className="admin-setting-header">{t('admin:user_group_management.basic_info')}</h2>

        {
          userGroup?.createdAt != null && (
            <div className="form-group row">
              <p className="col-md-2 col-form-label">{t('Created')}</p>
              <p className="col-md-4 my-auto">{dateFnsFormat(new Date(userGroup.createdAt), 'yyyy-MM-dd')}</p>
            </div>
          )
        }

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

        <div className="form-group row">
          <label htmlFor="parent" className="col-md-2 col-form-label">
            {t('admin:user_group_management.parent_group')}
          </label>
          <div className="dropdown col-md-4">
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown">
              {selectedParent?.name ?? t('admin:user_group_management.select_parent_group')}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {
                (parentUserGroups != null && parentUserGroups.length > 0) && (
                  <>
                    {
                      parentUserGroups.map(userGroup => (
                        <button
                          key={userGroup._id}
                          type="button"
                          className={`dropdown-item ${selectedParent?._id === userGroup._id ? 'active' : ''}`}
                          onClick={() => onChangeParerentButtonHandler(userGroup)}
                        >
                          {userGroup.name}
                        </button>
                      ))
                    }
                  </>
                )
              }
            </div>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-2 col-md-10">
            <button type="submit" className="btn btn-primary">
              {submitButtonLabel}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default UserGroupForm;
