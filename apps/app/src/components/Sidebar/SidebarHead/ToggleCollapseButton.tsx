import { memo, useCallback } from 'react';

import { useCollapsedContentsOpened, useCollapsedMode } from '~/stores/ui';


import styles from './ToggleCollapseButton.module.scss';


export const ToggleCollapseButton = memo((): JSX.Element => {

  const { data: isCollapsedMode, mutate: mutateCollapsedMode } = useCollapsedMode();
  const { mutate: mutateCollapsedContentsOpened } = useCollapsedContentsOpened();

  const toggle = useCallback(() => {
    mutateCollapsedMode(!isCollapsedMode);
    mutateCollapsedContentsOpened(false);
  }, [isCollapsedMode, mutateCollapsedContentsOpened, mutateCollapsedMode]);

  const rotationClass = isCollapsedMode ? 'rotate180' : '';
  const icon = isCollapsedMode ? 'keyboard_double_arrow_left' : 'first_page';

  return (
    <button type="button" className={`btn btn-primary ${styles['btn-toggle-collapse']} p-2`} onClick={toggle}>
      <span className={`material-icons fs-2 ${rotationClass}`}>{icon}</span>
    </button>
  );
});
