import React, { ReactNode } from 'react';

import { generateMxgraphData } from '../utils/embed';

import styles from './Drawio.module.scss';


type Props = {
  diagramIndex: number,
  bol?: number,
  eol?: number,
  drawioEmbedUri?: string,
  children?: ReactNode,
}

export const Drawio = (props: Props): JSX.Element => {
  const {
    diagramIndex, bol, eol, children,
  } = props;
  const drawioEmbedUri = props.drawioEmbedUri ?? 'https://embed.diagrams.net/';

  if (children == null) {
    return <></>;
  }

  const code = children instanceof Array
    ? children.map(e => e?.toString()).join('')
    : children.toString();

  const mxgraphData = generateMxgraphData(code, diagramIndex);

  const mxgraphHtml = `<div class="mxgraph" style="max-width: 100%; border: 1px solid transparent" data-mxgraph="${mxgraphData}"></div>`;

  return (
    <div
      key={`drawio-viewer-${diagramIndex}`}
      className={`drawio-viewer ${styles['drawio-viewer']}`}
      data-begin-line-number-of-markdown={bol}
      data-end-line-number-of-markdown={eol}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: mxgraphHtml }} />
    </div>
  );
};
