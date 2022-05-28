import React, { FC, useState } from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { useSWRxUsernames } from '~/stores/user';

export const SearchUsernameInput: FC = () => {
  const [inputText, setInputText] = useState('');

  const includeUserOptions = {
    isIncludeActiveUser: true,
    isIncludeInactiveUser: true,
    isIncludeActivitySnapshotUser: true,
  };
  const { data: usernameData, error } = useSWRxUsernames(inputText, 0, 3, includeUserOptions);
  const isLoading = usernameData === undefined && error == null;


  console.log(usernameData);

  return (
    <div className="input-group mr-2">
      <div className="input-group-prepend">
        <span className="input-group-text">
          <i className="icon-user"></i>
        </span>
      </div>
      <AsyncTypeahead
        id="auditlog-username-typeahead-asynctypeahead"
        caseSensitive={false}
        defaultSelected={[]}
        isLoading={isLoading}
        minLength={1}
        multiple
        newSelectionPrefix=""
      />
    </div>

  );
};
