import { memo } from 'react';

import GrowiLogo from '../Icons/GrowiLogo';

type SidebarBrandLogoProps = {
  isDefaultLogo?: boolean
}

export const SidebarBrandLogo = memo((props: SidebarBrandLogoProps) => {
  const { isDefaultLogo } = props;

  return isDefaultLogo
    ? <GrowiLogo />
    // eslint-disable-next-line @next/next/no-img-element
    : (<img src="/attachment/brand-logo" alt="custom logo" className="picture picture-lg p-2 mx-2" id="settingBrandLogo" width="32" />);
});

SidebarBrandLogo.displayName = 'SidebarBrandLogo';
