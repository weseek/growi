import { memo, useCallback } from 'react';

import {
  useCollapsedContentsOpened, usePreferCollapsedMode, useDrawerOpened, useSidebarMode,
} from '~/stores/ui';


import styles from './ToggleCollapseButton.module.scss';


export const ToggleCollapseButton = memo((): JSX.Element => {

  const { isDrawerMode, isCollapsedMode, isDockMode } = useSidebarMode();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { mutate: mutatePreferCollapsedMode } = usePreferCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const toggleDrawer = useCallback(() => {
    mutateDrawerOpened(!isDrawerOpened);
  }, [isDrawerOpened, mutateDrawerOpened]);

  const toggleCollapsed = useCallback(() => {
    mutatePreferCollapsedMode(!isCollapsedMode());
    mutateCollapsedContentsOpened(false);
  }, [isCollapsedMode, mutateCollapsedContentsOpened, mutatePreferCollapsedMode]);

  const rotationClass = isCollapsedMode() ? 'rotate180' : '';
  const icon = isDrawerMode() || isDockMode()
    ? 'first_page'
    : 'keyboard_double_arrow_left';

  return (
    <button
      type="button"
      className={`btn btn-primary ${styles['btn-toggle-collapse']} p-2`}
      onClick={isDrawerMode() ? toggleDrawer : toggleCollapsed}
    >
      <span className={`material-icons fs-2 ${rotationClass}`}>{icon}</span>
    </button>
  );
});
