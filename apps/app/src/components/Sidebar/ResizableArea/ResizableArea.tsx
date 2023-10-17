import React, { memo, useCallback, useRef } from 'react';


const sidebarNavWidth = 48;


type Props = {
  width: number,
  minWidth?: number,
  disabled?: boolean,
  children?: React.ReactNode,
  onResize?: (newWidth: number) => void,
  onResizeDone?: (newWidth: number) => void,
  onCollapsed?: () => void,
}

export const ResizableArea = memo((props: Props): JSX.Element => {
  const {
    width, minWidth = width,
    disabled, children,
    onResize, onResizeDone, onCollapsed,
  } = props;

  const resizableContainer = useRef<HTMLDivElement>(null);

  const draggableAreaMoveHandler = useCallback((event: MouseEvent) => {
    event.preventDefault();

    const widthByMousePos = event.pageX - sidebarNavWidth;

    const newWidth = Math.max(widthByMousePos, minWidth);
    onResize?.(newWidth);
    resizableContainer.current?.classList.add('dragging');
  }, [minWidth, onResize]);

  const dragableAreaMouseUpHandler = useCallback((event: MouseEvent) => {
    if (resizableContainer.current == null) {
      return;
    }

    const widthByMousePos = event.pageX - sidebarNavWidth;

    if (widthByMousePos < minWidth / 2) {
      // force collapsed
      onCollapsed?.();
    }
    else {
      const newWidth = resizableContainer.current.clientWidth;
      onResizeDone?.(newWidth);
    }

    resizableContainer.current.classList.remove('dragging');

  }, [minWidth, onCollapsed, onResizeDone]);

  const dragableAreaMouseDownHandler = useCallback((event: React.MouseEvent) => {
    if (disabled) {
      return;
    }

    event.preventDefault();

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', draggableAreaMoveHandler);
      document.removeEventListener('mouseup', dragableAreaMouseUpHandler);
      document.removeEventListener('mouseup', removeEventListeners);
    };

    document.addEventListener('mousemove', draggableAreaMoveHandler);
    document.addEventListener('mouseup', dragableAreaMouseUpHandler);
    document.addEventListener('mouseup', removeEventListeners);

  }, [dragableAreaMouseUpHandler, draggableAreaMoveHandler, disabled]);

  return (
    <>
      <div
        ref={resizableContainer}
        className="grw-contextual-navigation"
        style={{ width }}
      >
        <div className={`grw-contextual-navigation-child ${width === 0 ? 'd-none' : ''}`} data-testid="grw-contextual-navigation-child">
          {children}
        </div>
      </div>
      <div className="grw-navigation-draggable">
        { !disabled && (
          <div
            className="grw-navigation-draggable-hitarea"
            onMouseDown={dragableAreaMouseDownHandler}
          >
            <div className="grw-navigation-draggable-hitarea-child"></div>
          </div>
        ) }
      </div>
    </>
  );
});
