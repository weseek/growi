import React, { ReactNode } from 'react';

import { generateMxgraphData } from '../utils/embed';

import styles from './DrawioViewer.module.scss';


type Props = {
  diagramIndex: number,
  bol?: number,
  eol?: number,
  drawioEmbedUri?: string,
  children?: ReactNode,
}

export const DrawioViewer = (props: Props): JSX.Element => {
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

  const mxgraphHtml = `<div class="mxgraph" data-mxgraph="${mxgraphData}"></div>`;

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
