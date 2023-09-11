import React, { FC, memo } from 'react';

import { useKeywordManager } from '~/client/services/search-operation';
import { IDataTagCount } from '~/interfaces/tag';


type Props = {
  tags:IDataTagCount[],
  minSize?: number,
  maxSize?: number,
  maxTagTextLength?: number,
  isDisableRandomColor?: boolean,
};

const defaultProps = {
  isDisableRandomColor: true,
};

const MAX_TAG_TEXT_LENGTH = 8;

const TagCloudBox: FC<Props> = memo((props:(Props & typeof defaultProps)) => {
  const { tags } = props;
  const maxTagTextLength: number = props.maxTagTextLength ?? MAX_TAG_TEXT_LENGTH;

  const { pushState } = useKeywordManager();

  const tagElements = tags.map((tag:IDataTagCount) => {
    const tagNameFormat = (tag.name).length > maxTagTextLength ? `${(tag.name).slice(0, maxTagTextLength)}...` : tag.name;

    return (
      <a
        key={tag.name}
        type="button"
        className="grw-tag-label badge badge-secondary mr-2"
        onClick={() => pushState(`tag:${tag.name}`)}
      >
        {tagNameFormat}
      </a>
    );
  });

  return (
    <div className="grw-popular-tag-labels">
      {tagElements}
    </div>
  );

});

TagCloudBox.displayName = 'withLoadingSppiner';

TagCloudBox.defaultProps = defaultProps;

export default TagCloudBox;
