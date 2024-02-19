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

  const searchHandler = useCallback(async(query: string) => {
    const tagsSearchData = tagsSearch?.tags || [];
    setSearchQuery(query);
    tagsSearchData.unshift(query);
    setResultTags(Array.from(new Set(tagsSearchData)));
  }, [tagsSearch?.tags]);

  return (
    <div className="tag-typeahead">
      <AsyncTypeahead
        id="tag-typeahead-asynctypeahead"
        options={resultTags} // Search result (Some tag names)
        isLoading={isLoading}
        onSearch={searchHandler}
        defaultSelected={tags}
        multiple
        onChange={changeHandler}
        placeholder={t('tag_edit_modal.tags_input.tag_name')}
        autoFocus={autoFocus}
        minLength={1}
      />
    </div>
  );
};
