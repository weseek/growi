import React, { useState, useCallback, useRef } from 'react';

import type { IUserHasId } from '@growi/core';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';

import { IClearable } from '~/client/interfaces/clearable';

const dumyUserData = [
  {
    _id: '653140203f643f1ba8496867',
    username: 'test-user1',
  },
  {
    _id: '65314045a45f085023861c7a',
    username: 'test-user2',
  },
  {
    _id: '65314dfff63cae573793c2b8',
    username: 'test-user3',
  },
] as unknown as IUserHasId[];

const getUserIdsByUsernames = (data, usernames: string[] | undefined): string[] | undefined => {
  if (usernames == null || usernames.length === 0) {
    return;
  }

  return data
    .filter(item => usernames.includes(item.username))
    .map(item => item._id);
};

type Props = {
  onChange?: (userIds?: string[]) => void
};

export const SearchUserTypeahead = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const [selectedUsernames, setSelectedUsernames] = useState<string[]>();

  const { onChange } = props;

  const typeaheadRef = useRef<IClearable>(null);

  const onSearchHandler = useCallback((
      //
  ) => {}, []);

  const onChangeHandler = useCallback((usernames: string[]) => {
    setSelectedUsernames(usernames);

    const userIds = getUserIdsByUsernames(dumyUserData, usernames);

    if (onChange != null) {
      onChange(userIds);
    }
  }, [onChange]);

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
        // isLoading={isLoading}
        // options={allUser}
        onSearch={onSearchHandler}
        onChange={onChangeHandler}
        selected={selectedUsernames}
        options={dumyUserData.map(v => v.username)}
      />
    </div>
  );
};
