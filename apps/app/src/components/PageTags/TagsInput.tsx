import type { FC } from 'react';
import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { useSWRxTagsSearch } from '~/stores/tag';

type Props = {
  tags: string[],
  autoFocus: boolean,
  onTagsUpdated: (tags: string[]) => void,
}

export const TagsInput: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { tags, autoFocus, onTagsUpdated } = props;

  const [resultTags, setResultTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tagsSearch, error } = useSWRxTagsSearch(searchQuery);

  const isLoading = error == null && tagsSearch === undefined;

  const changeHandler = useCallback((selected: string[]) => {
    onTagsUpdated(selected);
  }, [onTagsUpdated]);

  const searchHandler = useCallback((query: string) => {
    const tagsSearchData = tagsSearch?.tags || [];
    setSearchQuery(query);
    tagsSearchData.unshift(query);
    setResultTags(Array.from(new Set(tagsSearchData)));
  }, [tagsSearch?.tags]);

  return (
    <div className="tag-typeahead">
      <AsyncTypeahead
        id="tag-typeahead-asynctypeahead"
        isLoading={isLoading}
        minLength={1}
        defaultSelected={tags}
        multiple
        onChange={changeHandler}
        onSearch={searchHandler}
        options={resultTags} // Search result (Some tag names)
        placeholder={t('tag_edit_modal.tags_input.tag_name')}
        autoFocus={autoFocus}
      />
    </div>
  );
};
