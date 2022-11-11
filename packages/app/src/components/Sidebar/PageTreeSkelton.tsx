import React from 'react';

import ItemsTreeSkelton from './PageTree/ItemsTreeSkelton';
import SidebarHeaderSkelton from './Skelton/SidebarHeaderSkelton';

const PageTreeSkelton = (): JSX.Element => {

  return (
    <>
      <SidebarHeaderSkelton />
      <ItemsTreeSkelton />
    </>
  );
};

export default PageTreeSkelton;
