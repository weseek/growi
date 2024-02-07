import React from 'react';

import { useKeywordManager } from '~/client/services/search-operation';

type RenderTagLabelsProps = {
  tags: string[],
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const { tags } = props;

  const { pushState } = useKeywordManager();

  return (
    <>
      {tags.map((tag) => {
        return (
          <a
            key={tag}
            type="button"
            className="grw-tag badge me-1 mb-1"
            onClick={() => pushState(`tag:${tag}`)}
          >
            {tag}
          </a>
        );
      })}
    </>

  );

});

RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
