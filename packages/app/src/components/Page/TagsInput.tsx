import React, {
  FC, useRef, useState, useCallback,
} from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { apiGet } from '~/client/util/apiv1-client';
import { toastError } from '~/client/util/apiNotification';
import { ITagsSearchApiv1Result } from '~/interfaces/tag';

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
  const [isLoading, setLoading] = useState(false);

  const changeHandler = useCallback((selected: string[]) => {
    if (props.onTagsUpdated != null) {
      props.onTagsUpdated(selected);
    }
  }, [props]);

  const searchHandler = useCallback(async(query: string) => {
    setLoading(true);
    try {
      // TODO: 91698 SWRize
      const res = await apiGet('/tags.search', { q: query }) as ITagsSearchApiv1Result;
      res.tags.unshift(query);
      setResultTags(Array.from(new Set(res.tags)));
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setLoading(false);
    }
  }, []);

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
