import React, {
  FC, useRef, useState, useCallback,
} from 'react';

import { useTranslation } from 'next-i18next';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

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

export const TagsInput: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const tagsInputRef = useRef<TypeaheadInstance>(null);

  const [resultTags, setResultTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tagsSearch, error } = useSWRxTagsSearch(searchQuery);

  const isLoading = error == null && tagsSearch === undefined;

  const changeHandler = useCallback((selected: string[]) => {
    if (props.onTagsUpdated != null) {
      props.onTagsUpdated(selected);
    }
  }, [props]);

  const searchHandler = useCallback(async(query: string) => {
    const tagsSearchData = tagsSearch?.tags || [];
    setSearchQuery(query);
    tagsSearchData.unshift(query);
    setResultTags(Array.from(new Set(tagsSearchData)));

  }, [tagsSearch?.tags]);

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
        placeholder={t('tag_edit_modal.tags_input.tag_name')}
        autoFocus={props.autoFocus}
      />
    </div>
  );
};
