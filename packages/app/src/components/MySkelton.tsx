import React from 'react';

import ContentLoader from 'react-content-loader';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const MySkelton = (props: JSX.IntrinsicAttributes) => (
  <ContentLoader
    speed={2}
    width={400}
    height={160}
    viewBox="0 0 400 160"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
  </ContentLoader>
);
