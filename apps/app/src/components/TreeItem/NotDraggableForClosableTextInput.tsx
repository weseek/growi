import type { ReactNode } from 'react';

type NotDraggableProps = {
  children: ReactNode,
};

/**
 * Component wrapper to make a child element not draggable
 * @see https://github.com/react-dnd/react-dnd/issues/335
 */
export const NotDraggableForClosableTextInput = (props: NotDraggableProps): JSX.Element => {
  return <div draggable onDragStart={e => e.preventDefault()}>{props.children}</div>;
};
