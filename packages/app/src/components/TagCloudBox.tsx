import React, { FC, memo } from 'react';
import { TagCloud } from 'react-tagcloud';
import { ITagCountHasId } from '~/interfaces/tag';

type Props = {
  tags:ITagCountHasId[],
  minSize?: number,
  maxSize?: number,
  maxTagTextLength?: number,
  isDisableRandomColor?: boolean,
};

const defaultProps = {
  isDisableRandomColor: true,
};

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;
const MAX_TAG_TEXT_LENGTH = 8;

const TagCloudBox: FC<Props> = memo((props:(Props & typeof defaultProps)) => {
  const {
    tags, minSize, maxSize, isDisableRandomColor,
  } = props;
  const maxTagTextLength: number = props.maxTagTextLength ?? MAX_TAG_TEXT_LENGTH;

  return (
    <>
      <TagCloud
        minSize={minSize ?? MIN_FONT_SIZE}
        maxSize={maxSize ?? MAX_FONT_SIZE}
        tags={tags.map((tag:ITagCountHasId) => {
          return {
            // text truncation
            value: (tag.name).length > maxTagTextLength ? `${(tag.name).slice(0, maxTagTextLength)}...` : tag.name,
            count: tag.count,
          };
        })}
        disableRandomColor={isDisableRandomColor}
        style={{ cursor: 'pointer' }}
        className="simple-cloud text-secondary"
        onClick={(target) => { window.location.href = `/_search?q=tag:${encodeURIComponent(target.value)}` }}
      />
    </>
  );

});

TagCloudBox.defaultProps = defaultProps;

export default TagCloudBox;
