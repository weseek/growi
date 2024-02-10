import React, { useRef, useEffect, useState } from 'react';

import SimpleBar from 'simplebar-react';

import { useKeywordManager } from '~/client/services/search-operation';

type RenderTagLabelsProps = {
  tags: string[],
  maxWidth?: number
}

const RenderTagLabels = React.memo((props: RenderTagLabelsProps) => {
  const { tags, maxWidth = 250 } = props;

  const { pushState } = useKeywordManager();

  const [maxHeight, setMaxHeight] = useState<number | string>('100px');
  const aRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (aRef.current) {
      const aHeight = aRef.current.offsetHeight;
      setMaxHeight(`calc((${aHeight}px + 0.25rem) * 3)`);
    }
  }, [tags]);

  return (
    <SimpleBar className="pe-1" style={{ maxHeight, width: maxWidth }}>
      {tags.map(tag => (
        <a
          key={tag}
          type="button"
          className="grw-tag badge me-1 mb-1 text-truncate"
          onClick={() => pushState(`tag:${tag}`)}
          style={{ maxWidth: `calc(${maxWidth}px - 0.25rem)` }}
          ref={aRef}
        >
          {tag}
        </a>
      ))}
    </SimpleBar>
  );
});
RenderTagLabels.displayName = 'RenderTagLabels';

export default RenderTagLabels;
