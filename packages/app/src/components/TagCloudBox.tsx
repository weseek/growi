import React, { FC } from 'react';
import { TagCloud } from 'react-tagcloud';
import { ITagDataHasId } from '~/interfaces/tag';

type Props = {
  tags:ITagDataHasId[],
  minSize?: number,
  maxSize?: number,
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 36;

const TagCloudBox: FC<Props> = (props:Props) => {
  return (
    <>
      <TagCloud
        minSize={props.minSize || MIN_FONT_SIZE}
        maxSize={props.maxSize || MAX_FONT_SIZE}
        tags={props.tags.map((tag) => {
          return { value: tag.name, count: tag.count };
        })}
        style={{ cursor: 'pointer' }}
        className="simple-cloud"
        onClick={(target) => { window.location.href = `/_search?q=tag:${encodeURIComponent(target.value)}` }}
      />
    </>
  );

};

export default TagCloudBox;
