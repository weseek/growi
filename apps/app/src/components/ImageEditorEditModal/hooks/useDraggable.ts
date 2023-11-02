import { useState } from 'react';

import Konva from 'konva';

export const useDraggable = ({ updateShape }) => {
  const [draggable, setDraggable] = useState(true);
  const [selected, setSelected] = useState<null | string, Dispatch<SetStateAction<string | null>>>(null);

  const unselect = (e?) => {
    if (e === undefined) {
      setSelected(null);
      return;
    }

    const emptyClicked = e.target === e.target.getStage();

    if (emptyClicked) {
      setSelected(null);
    }
  };

  const onDragStart = (
      e: Konva.KonvaEventObject<DragEvent>,
      shape: Konva.ShapeConfig,
  ) => {
    setSelected(shape.id);
  };

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateShape({
      id: selected,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  return {
    draggable,
    setDraggable,

    selected,
    setSelected,
    unselect,

    onDragStart,
    onDragEnd,
  };
};
