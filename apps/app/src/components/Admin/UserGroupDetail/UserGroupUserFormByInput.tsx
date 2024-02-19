import type { FC } from 'react';
import React, { useState } from 'react';

import type { IUserGroupHasId, IUserHasId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { debounce } from 'throttle-debounce';

import { toastSuccess, toastError } from '~/client/util/toastr';
import Xss from '~/services/xss';

type Props = {
  isAlsoMailSearched: boolean,
  isAlsoNameSearched: boolean,
  onClickAddUserBtn: (username: string) => Promise<void>,
  onSearchApplicableUsers: (searchWord: string) => Promise<IUserHasId[]>,
  userGroup: IUserGroupHasId,
}

export const UserGroupUserFormByInput: FC<Props> = (props) => {
  const {
    isAlsoMailSearched, isAlsoNameSearched, onClickAddUserBtn, onSearchApplicableUsers, userGroup,
  } = props;

  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [inputUser, setInputUser] = useState<IUserHasId[]>([]);
  const [applicableUsers, setApplicableUsers] = useState<IUserHasId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchError, setIsSearchError] = useState(false);

  const xss = new Xss();

  const addUserBySubmit = async() => {
    if (inputUser.length === 0) { return }
    const userName = inputUser[0].username;

    try {
      await onClickAddUserBtn(userName);
      toastSuccess(`Added "${xss.process(userName)}" to "${xss.process(userGroup.name)}"`);
      setInputUser([]);
    }
    catch (err) {
      toastError(new Error(`Unable to add "${xss.process(userName)}" to "${xss.process(userGroup.name)}"`));
    }
  };

  const searchApplicableUsers = async() => {
    try {
      const users = await onSearchApplicableUsers(keyword);
      setApplicableUsers(users);
      setIsLoading(false);
    }
    catch (err) {
      setIsSearchError(true);
      toastError(err);
    }
  };

  const searchApplicableUsersDebounce = debounce(1000, searchApplicableUsers);

  const handleChange = (inputUser: IUserHasId[]) => {
    setInputUser(inputUser);
  };

  const handleSearch = (keyword) => {
    if (keyword === '') {
      return;
    }

    setKeyword(keyword);
    setIsLoading(true);
    searchApplicableUsersDebounce();
  };

  const onKeyDown = (event) => {
    // 13 is Enter key
    if (event.keyCode === 13) {
      addUserBySubmit();
    }
  };

  const renderMenuItemChildren = (option) => {
    const user = option;

    return (
      <>
        <UserPicture user={user} size="sm" noLink noTooltip />
        <strong className="ms-2">{user.username}</strong>
        {isAlsoNameSearched && <span className="ms-2">{user.name}</span>}
        {isAlsoMailSearched && <span className="ms-2">{user.email}</span>}
      </>
    );
  };

  return (
    <div className="row">
      <div className="col-8 pe-0">
        <AsyncTypeahead
          id="name-typeahead-asynctypeahead"
          isLoading={isLoading}
          labelKey={(user: IUserHasId) => `${user.username} ${user.name} ${user.email}`}
          options={applicableUsers} // Search result
          onSearch={handleSearch}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          minLength={0}
          searchText={isLoading ? 'Searching...' : (isSearchError && 'Error on searching.')}
          renderMenuItemChildren={renderMenuItemChildren}
          align="left"
          clearButton
        />
      </div>
      <div className="col-2 ps-0">
        <button
          type="button"
          className="btn btn-success"
          disabled={inputUser.length === 0}
          onClick={addUserBySubmit}
        >
          {t('add')}
        </button>
      </div>
    </div>
  );
};
