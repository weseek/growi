import React, { FC, useCallback } from 'react';

type Props = {
  iconClass: string,
}

const DrawerToggler: FC<Props> = (props: Props) => {

  const clickHandler = useCallback(() => {
    // navigationContainer.toggleDrawer();
  }, []);

  const iconClass = props.iconClass || 'icon-menu';

  return (
    <button
      className="grw-drawer-toggler btn btn-secondary"
      type="button"
      aria-expanded="false"
      aria-label="Toggle navigation"
      onClick={clickHandler}
    >
      <i className={iconClass}></i>
    </button>
  );

};

export default DrawerToggler;
