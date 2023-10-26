import React, { useState, useCallback, useRef } from 'react';

import type { IUserHasId } from '@growi/core';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';

import { IClearable } from '~/client/interfaces/clearable';
import { useSWRxSearchUsers } from '~/stores/user';

const getUserIdsByUsernames = (userData?: IUserHasId[], usernames?: string[]): string[] | undefined => {
  if (userData == null || usernames == null || usernames.length === 0) {
    return;
  }

  return userData
    .filter(item => usernames.includes(item.username))
    .map(item => item._id);
};

type Props = {
  excludedSearchUserIds?: string[]
  onChange?: (userIds?: string[]) => void
};

export const SearchUserTypeahead = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { excludedSearchUserIds, onChange } = props;

  const [selectedUsernames, setSelectedUsernames] = useState<string[]>();
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const excludedSearchUserIdData = JSON.stringify(excludedSearchUserIds);
  const { data: userData, isLoading } = useSWRxSearchUsers(searchKeyword, 0, 5, excludedSearchUserIdData);

  const typeaheadRef = useRef<IClearable>(null);

  const onSearchHandler = useCallback((text: string) => {
    setSearchKeyword(text);
  }, []);

  const onChangeHandler = useCallback((usernames: string[]) => {
    setSelectedUsernames(usernames);

    if (onChange != null) {
      const userIds = getUserIdsByUsernames(userData?.users, usernames);
      onChange(userIds);
    }
  }, [onChange, userData]);

  return (
    <div className="input-group me-2">
      <span className="input-group-text">
        <i className="icon-people" />
      </span>
      <AsyncTypeahead
        id="user-typeahead-asynctypeahea"
        ref={typeaheadRef}
        multiple
        delay={400}
        minLength={0}
        caseSensitive={false}
        isLoading={isLoading}
        onSearch={onSearchHandler}
        onChange={onChangeHandler}
        selected={selectedUsernames}
        options={userData?.users?.map(v => v.username)}
      />
    </div>
  );
};
