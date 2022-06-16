import React, {
  FC, useRef, useState, useCallback,
} from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { toastError } from '~/client/util/apiNotification';
import { useSWRxTagsSearch } from '~/stores/tag';

type TypeaheadInstance = {
  _handleMenuItemSelect: (activeItem: string, event: React.KeyboardEvent) => void,
  state: {
    initialItem: string,
  },
}

type Props = {
  tags: string[],
  autoFocus: boolean,
  onTagsUpdated: (tags: string[]) => void,
}

const TagsInput: FC<Props> = (props: Props) => {
  const tagsInputRef = useRef<TypeaheadInstance>(null);

  const [resultTags, setResultTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tagsSearchData, error } = useSWRxTagsSearch(searchQuery);

  const isLoading = error == null && tagsSearchData === undefined;

  const changeHandler = useCallback((selected: string[]) => {
    if (props.onTagsUpdated != null) {
      props.onTagsUpdated(selected);
    }
  }, [props]);

  const searchHandler = useCallback(async(query: string) => {
    setSearchQuery(query);
    tagsSearchData?.tags.unshift(searchQuery);
    setResultTags(Array.from(new Set(tagsSearchData?.tags)));
  }, [searchQuery, tagsSearchData?.tags]);

  const keyDownHandler = useCallback((event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();

      const initialItem = tagsInputRef?.current?.state?.initialItem;
      const handleMenuItemSelect = tagsInputRef?.current?._handleMenuItemSelect;

      if (initialItem != null && handleMenuItemSelect != null) {
        handleMenuItemSelect(initialItem, event);
      }
    }
  }, []);

  return (
    <div className="tag-typeahead">
      <AsyncTypeahead
        id="tag-typeahead-asynctypeahead"
        ref={tagsInputRef}
        caseSensitive={false}
        defaultSelected={props.tags ?? []}
        isLoading={isLoading}
        minLength={1}
        multiple
        newSelectionPrefix=""
        onChange={changeHandler}
        onSearch={searchHandler}
        onKeyDown={keyDownHandler}
        options={resultTags} // Search result (Some tag names)
        placeholder="tag name"
        autoFocus={props.autoFocus}
      />
    </div>
  );
};

export default TagsInput;
