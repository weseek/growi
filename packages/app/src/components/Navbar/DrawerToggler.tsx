import React, { FC } from 'react';

import { useDrawerOpened } from '~/stores/ui';

type Props = {
  iconClass?: string,
}

const DrawerToggler: FC<Props> = (props: Props) => {

  const { data: isOpened, mutate } = useDrawerOpened();

  const iconClass = props.iconClass || 'icon-menu';

  return (
    <button
      className="grw-drawer-toggler btn btn-secondary"
      type="button"
      aria-expanded="false"
      aria-label="Toggle navigation"
      onClick={() => mutate(!isOpened)}
    >
      <i className={iconClass}></i>
    </button>
  );

};

export default DrawerToggler;
