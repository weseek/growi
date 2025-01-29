import { memo } from 'react';

import GrowiLogo from '../../../components/Common/GrowiLogo';

import styles from './SidebarBrandLogo.module.scss';

type SidebarBrandLogoProps = {
  isDefaultLogo?: boolean
}

export const SidebarBrandLogo = memo((props: SidebarBrandLogoProps) => {
  const { isDefaultLogo } = props;

  return isDefaultLogo
    ? <div className={styles['grw-logo']}><GrowiLogo /></div>
    // eslint-disable-next-line @next/next/no-img-element
    : (<div><img src="/attachment/brand-logo" alt="custom logo" className="picture picture-lg p-2" id="settingBrandLogo" /></div>);
});

SidebarBrandLogo.displayName = 'SidebarBrandLogo';
