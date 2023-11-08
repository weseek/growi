import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';

import type { IUserHasId } from '@growi/core';
import { AsyncTypeahead, Token } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';

import { IClearable } from '~/client/interfaces/clearable';
import { useSWRMUTxSearchUser } from '~/stores/user';

type Props = {
  isEditable: boolean
  selectedUsers?: IUserHasId[] // for updated
  approvedUserIds?: string[]
  excludedSearchUserIds?: string[]
  onChange?: (userIds: string[]) => void
  onRemoveLastEddtingApprover?: () => void
};

export const SearchUserTypeahead = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    isEditable, selectedUsers, approvedUserIds, excludedSearchUserIds, onChange, onRemoveLastEddtingApprover,
  } = props;

  const typeaheadRef = useRef<IClearable>(null);

  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const { trigger: searchUser, data: userData, isMutating } = useSWRMUTxSearchUser('asc', 'username', 1, searchKeyword, excludedSearchUserIds);

  const onSearchHandler = useCallback((searchKeyword: string) => {
    setSearchKeyword(searchKeyword);
  }, []);

  const onChangeHandler = useCallback((selectedUsers: IUserHasId[]) => {
    if (selectedUsers.length <= 0 && onRemoveLastEddtingApprover != null) {
      onRemoveLastEddtingApprover();
      return;
    }
    if (onChange != null) {
      const userIds = selectedUsers.map(user => user._id);
      onChange(userIds);
    }
  }, [onChange, onRemoveLastEddtingApprover]);

  const renderToken = (option: IUserHasId) => {
    const isApproved = approvedUserIds?.includes(option._id);
    const isDisabled = !isEditable || isApproved;
    return (
      <Token onRemove={() => {}} disabled={isDisabled} readOnly={false}>{option.username}</Token>
    );
  };

  useEffect(() => {
    if (searchKeyword.trim() !== '') {
      searchUser();
    }
  }, [searchKeyword, searchUser]);

  return (
    <div className="input-group me-2">
      <span className="input-group-text">
        <i className="icon-people" />
      </span>
      <AsyncTypeahead
        id="user-typeahead-asynctypeahead"
        ref={typeaheadRef}
        multiple
        disabled={!isEditable}
        delay={200}
        minLength={1}
        useCache={false}
        caseSensitive={false}
        isLoading={isMutating}
        onSearch={onSearchHandler}
        onChange={onChangeHandler}
        defaultSelected={selectedUsers}
        options={userData?.docs ?? []}
        labelKey={(option: IUserHasId) => option.username}
        renderToken={(option: IUserHasId) => renderToken(option)}
      />
    </div>
  );
};
