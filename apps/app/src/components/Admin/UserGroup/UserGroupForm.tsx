import React, { FC, useCallback, useState } from 'react';

import dateFnsFormat from 'date-fns/format';
import { useTranslation } from 'next-i18next';

import { IUserGroupHasId } from '~/interfaces/user';

type Props = {
  userGroup: IUserGroupHasId,
  parentUserGroup?: IUserGroupHasId,
  selectableParentUserGroups?: IUserGroupHasId[],
  submitButtonLabel: string;
  onSubmit?: (targetGroup: IUserGroupHasId, userGroupData: Partial<IUserGroupHasId>) => Promise<void> | void
};

export const UserGroupForm: FC<Props> = (props: Props) => {

  const { t } = useTranslation('admin');

  const {
    userGroup, parentUserGroup, selectableParentUserGroups, submitButtonLabel, onSubmit,
  } = props;
  /*
   * State
   */
  const [currentName, setName] = useState<string>(userGroup.name);
  const [currentDescription, setDescription] = useState<string>(userGroup.description);
  const [selectedParent, setSelectedParent] = useState<IUserGroupHasId | undefined>(parentUserGroup);
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
      setSelectedParent(userGroup);
    }
  }, [selectedParent, setSelectedParent]);

  const isSelectableParentUserGroups = selectableParentUserGroups != null && selectableParentUserGroups.length > 0;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit?.(props.userGroup, {
        name: currentName,
        description: currentDescription,
        parent: selectedParent,
      });
    }}
    >

      <fieldset>
        <h2 className="admin-setting-header">{t('user_group_management.basic_info')}</h2>

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
            {t('user_group_management.group_name')}
          </label>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              name="name"
              placeholder={t('user_group_management.group_example')}
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
            <textarea className="form-control" name="description" value={currentDescription} onChange={onChangeDescriptionHandler} />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="parent" className="col-md-2 col-form-label">
            {t('user_group_management.parent_group')}
          </label>
          <div className="dropdown col-md-4">
            <button
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              className={`
                btn btn-outline-secondary dropdown-toggle mb-3 ${isSelectableParentUserGroups ? '' : 'disabled'}
              `}
            >
              {selectedParent?.name ?? t('user_group_management.select_parent_group')}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {
                (isSelectableParentUserGroups) && (
                  <>
                    {
                      selectableParentUserGroups.map(userGroup => (
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

              <div className="dropdown-divider" />

              <button
                className="dropdown-item"
                type="button"
                onClick={() => { setSelectedParent(undefined) }}
              >{t('user_group_management.release_parent_group')}
              </button>
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
