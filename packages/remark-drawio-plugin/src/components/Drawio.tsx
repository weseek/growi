import React, { ReactNode } from 'react';

type Props = {
  drawioEmbedUri?: string,
  children?: ReactNode,
}

export const Drawio = (props: Props): JSX.Element => {
  const { children } = props;
  const drawioEmbedUri = props.drawioEmbedUri ?? 'https://embed.diagrams.net/';

  return <span>{children}</span>;
};
