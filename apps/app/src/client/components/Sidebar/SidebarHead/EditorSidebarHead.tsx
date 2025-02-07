import React, {
  type FC, memo,
} from 'react';

import { AppTitleOnSidebarHead } from '../AppTitle/AppTitle';


import styles from './SidebarHead.module.scss';


export const EditorSidebarHead: FC = memo(() => {
  return (
    <div className={`${styles['grw-sidebar-head']}`}>
      <AppTitleOnSidebarHead />
    </div>
  );
});
