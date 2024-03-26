import { FC, useCallback } from 'react';

import { SidebarContentsType, SidebarMode } from '~/interfaces/ui';
import { useCollapsedContentsOpened, useCurrentSidebarContents } from '~/stores/ui';


const useIndicator = (sidebarMode: SidebarMode, isSelected: boolean): string => {
  const { data: isCollapsedContentsOpened } = useCollapsedContentsOpened();

  if (sidebarMode === SidebarMode.COLLAPSED && !isCollapsedContentsOpened) {
    return '';
  }

  return isSelected ? 'active' : '';
};

export type Props = {
  contents: SidebarContentsType,
  label: string,
  iconName: string,
  sidebarMode: SidebarMode,
  badgeContents?: number,
  onHover?: (contents: SidebarContentsType) => void,
  onClick?: () => void,
}

export const PrimaryItem: FC<Props> = (props: Props) => {
  const {
    contents, label, iconName, sidebarMode, badgeContents,
    onClick, onHover,
  } = props;

  const { data: currentContents, mutateAndSave: mutateContents } = useCurrentSidebarContents();

  const indicatorClass = useIndicator(sidebarMode, contents === currentContents);

  const selectThisItem = useCallback(() => {
    mutateContents(contents, false);
  }, [contents, mutateContents]);

  const itemClickedHandler = useCallback(() => {
    // do nothing ONLY WHEN the collapse mode
    if (sidebarMode === SidebarMode.COLLAPSED) {
      return;
    }

    selectThisItem();
    onClick?.();
  }, [onClick, selectThisItem, sidebarMode]);

  const mouseEnteredHandler = useCallback(() => {
    // ignore other than collapsed mode
    if (sidebarMode !== SidebarMode.COLLAPSED) {
      return;
    }

    selectThisItem();
    onHover?.(contents);
  }, [contents, onHover, selectThisItem, sidebarMode]);


  const labelForTestId = label.toLowerCase().replace(' ', '-');

  return (
    <button
      type="button"
      data-testid={`grw-sidebar-nav-primary-${labelForTestId}`}
      className={`btn btn-primary ${indicatorClass}`}
      onClick={itemClickedHandler}
      onMouseEnter={mouseEnteredHandler}
    >
      <div className="position-relative">
        { badgeContents != null && (
          <span className="position-absolute badge rounded-pill bg-primary">{badgeContents}</span>
        )}
        <span className="material-symbols-outlined">{iconName}</span>
      </div>
    </button>
  );
};
