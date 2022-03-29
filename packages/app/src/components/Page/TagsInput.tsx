import React, {
  FC, useRef, useState,
} from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { apiGet } from '~/client/util/apiv1-client';

import { ITagsSearchApiv1Result } from '~/interfaces/tag';

type TypeaheadInstance = {
  focus: () => void,
  _handleMenuItemSelect: (activeItem: string, e: React.KeyboardEvent) => void,
  state: {
    initialItem: string,
  },
}

type Props = {
  tags: string[],
  onTagsUpdated: (tags: string[]) => void,
  autoFocus: boolean
}

const TagsInput: FC<Props> = (props: Props) => {
  const tagsInputRef = useRef<TypeaheadInstance>(null);

  const [resultTags, setResultTags] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  const handleChange = (selected: string[]) => {
    if (props.onTagsUpdated != null) {
      props.onTagsUpdated(selected);
    }
  };

  const handleSearch = async(query: string) => {
    setLoading(true);
    try {
      // TODO: 91698 SWRize
      const res = await apiGet('/tags.search', { q: query }) as ITagsSearchApiv1Result;
      res.tags.unshift(query);
      setResultTags(Array.from(new Set(res.tags)));
    }
    catch (err) {
      //
    }
    finally {
      setLoading(false);
    }
  };

  const handleSelect = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      const initialItem = tagsInputRef?.current?.state?.initialItem;
      const handleMenuItemSelect = tagsInputRef?.current?._handleMenuItemSelect;

      if (initialItem != null && handleMenuItemSelect != null) {
        handleMenuItemSelect(initialItem, e);
      }
    }
  };

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
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleSelect}
        options={resultTags} // Search result (Some tag names)
        placeholder="tag name"
        autoFocus={props.autoFocus}
      />
    </div>
  );
};

export default TagsInput;
