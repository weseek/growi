import React from 'react';

import { useDrawerOpened } from '~/stores/ui';

type Props = {
  iconClass?: string,
}

const DrawerToggler = (props: Props): JSX.Element => {

  const { data: isOpened, mutate } = useDrawerOpened();

  const iconClass = props.iconClass ?? isOpened
    ? 'icon-arrow-left'
    : 'icon-arrow-right';

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
