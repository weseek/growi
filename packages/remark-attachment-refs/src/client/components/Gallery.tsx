import React from 'react';

import { RefsImgSubstance, Props } from './RefsImg';

export const Gallery = React.memo((props: Props): JSX.Element => {
  return <RefsImgSubstance {...props} />;
});

export const GalleryImmutable = React.memo((props: Omit<Props, 'isImmutable'>): JSX.Element => {
  const grid = props.grid || 'col4';
  const gridGap = props.gridGap || '1px';
  return <RefsImgSubstance grid={grid} gridGap={gridGap} {...props} isImmutable />;
});

Gallery.displayName = 'Gallery';
