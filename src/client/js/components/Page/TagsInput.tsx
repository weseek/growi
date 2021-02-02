import React, { FC, useState, useEffect } from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { apiGet } from '~/client/js/util/apiv1-client';

import { Tag } from '~/interfaces/page';

type Props = {
  tags: Tag[],
  onTagsUpdated: <T extends Tag[]>(T) => void,
  autoFocus: boolean,
}

const TagsInput : FC<Props> = (props: Props) => {
  const [resultTags, setResultTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(props.tags);
  const [defaultPageTags, setDefaultPageTags] = useState(props.tags);

  useEffect(() => {
    AsyncTypeahead.typeahead.getInstance().focus();
  });

  function handleChange(selected) {
    setSelected(selected);
    props.onTagsUpdated(selected);
  }

  async function handleSearch(query) {
    setIsLoading(true);
    const res = await apiGet('/tags.search', { q: query });
    res.tags.unshift(query); // selectable new tag whose name equals query

    setResultTags(Array.from(new Set(res.tags))); // use Set for de-duplication
    setIsLoading(false);
  }

  function handleSelect(e) {
    if (e.keyCode === 32) { // '32' means ASCII code of 'space'
      e.preventDefault();
      const instance = AsyncTypeahead.typeahead.getInstance();
      const { initialItem } = instance.state;

      if (initialItem) {
        instance._handleMenuItemSelect(initialItem, e);
      }
    }
  }


  return (
    <div className="tag-typeahead">
      <AsyncTypeahead
        id="tag-typeahead-asynctypeahead"
        ref={(typeahead) => { AsyncTypeahead.typeahead = typeahead }}
        caseSensitive={false}
        defaultSelected={defaultPageTags}
        isLoading={isLoading}
        minLength={1}
        multiple
        newSelectionPrefix=""
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleSelect}
        options={resultTags} // Search result (Some tag names)
        placeholder="tag name"
        selectHintOnEnter
        autoFocus={props.autoFocus}
      />
    </div>
  );

};

export default TagsInput;
