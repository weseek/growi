import { useState } from 'react';

import Konva from 'konva';

export const useDrawing = ({ addShape, setSelected }) => {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [willDrawing, setWillDrawing] = useState<boolean>(false);
  const [mode, setMode] = useState<string>('pen');
  const [points, setPoints] = useState<Konva.LineConfig['points']>([]);

  const onDrawStart = (
      e: Konva.KonvaEventObject<DragEvent>,
  ) => {
    setDrawing(true);
    setWillDrawing(false);

    const stage = e.target.getStage();
    const scaleX = stage.scaleX();
    const scaleY = stage.scaleY();

    const point = e.target.getStage().getPointerPosition();

    setPoints([
      ...points,
      point.x / scaleX,
      point.y / scaleY,
    ]);
  };

  const onDrawing = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!drawing) {
      return;
    }

    const stage = e.target.getStage();
    console.log('drawing');
    const scaleX = stage.scaleX();
    const scaleY = stage.scaleY();

    const point = stage.getPointerPosition();

    setPoints(points.concat([
      point.x / scaleX,
      point.y / scaleY,
    ]));
  };

  const onDrawEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setDrawing(false);
    const [shape] = addShape({
      type: 'line',
      mode,
      points,
    });
    setSelected(shape.id);
    setPoints([]);
  };

  // const setModeToPen = () => {
  //   setMode('pen');
  // };

  // const setModeToEraser = () => {
  //   setMode('eraser');
  // };

  // const toggleMode = () => {
  //   if (mode === 'pen') {
  //     setModeToEraser();
  //   } else {
  //     setModeToPen();
  //   }
  // };

  return {
    points,
    setDrawing,
    onDrawing,
    willDrawing,
    setWillDrawing,
    mode,
    setMode,
    drawing,
    onDrawStart,
    onDrawEnd,
    // setModeToPen,
    // setModeToEraser,
    // toggleMode,
  };
};
