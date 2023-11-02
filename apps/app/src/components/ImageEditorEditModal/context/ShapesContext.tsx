import React, { createContext, ReactNode, useContext } from 'react';

import Konva from 'konva';

import {
  useDraggable, useShapes, useFocusable, useZoom, useDrawing, useStage,
} from '../hooks';

interface IShapesContext {
  shapes: Konva.ShapeConfig[];
  selected: null | string;
  focused: null | string;
  draggable: boolean;
  getShapeById: (id: string) => Konva.ShapeConfig | undefined;
  setDraggable: (draggable: boolean) => void;
  updateShape: <T extends Konva.ShapeConfig>(
    config: T & { id: string; },
    options?: { saveHistory: boolean }
  ) => Konva.ShapeConfig[];
  addShape: <T extends Konva.ShapeConfig>(shape: T | T[])
    => Konva.ShapeConfig[];
  duplicateShape: (id: string) => Konva.ShapeConfig;
  removeShape: (id: string) => void;
  onDragStart: (e, shape: Konva.ShapeConfig) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  unselect: (e?) => void;
  unfocus: (e?) => void;
  setSelected: (id: string) => void;
  setFocused: (id: string) => void;

  toForward: (id: string) => void;
  toBackward: (id: string) => void;

  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: (e?) => void;
  zoomOut: (e?) => void;

  drawing: boolean;
  mode: string;
  setDrawing: (drawing: boolean) => void;
  willDrawing: boolean;
  setWillDrawing: (willDrawing: boolean) => void;
  onDrawStart: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDrawEnd: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDrawing: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  points: Konva.LineConfig['points'];

  stage: Konva.Stage;
  setStage: (stage: Konva.Stage) => void;
  layer: Konva.Layer;
  setLayer: (layer: Konva.Layer) => void;
}

const defaultValue = {
  shapes: [],
  selected: null,
  focused: null,
  updateShape: () => [],
  addShape: () => [{ x: 0, y: 0 }],
  removeShape: () => {},
  duplicateShape: () => { return { x: 0, y: 0 } },
  onDragStart: () => { },
  onDragEnd: () => { },
  unselect: () => { },
  unfocus: () => { },
  setSelected: () => { },
  setFocused: () => {},
  draggable: false,
  setDraggable: () => {},
  getShapeById: () => undefined,

  toForward: () => {},
  toBackward: () => {},

  zoom: 5,
  canZoomIn: true,
  canZoomOut: true,
  zoomIn: () => {},
  zoomOut: () => {},

  setModeToEraser: () => {},
  setModeToPen: () => {},
  drawing: false,
  mode: 'pen',
  setDrawing: () => {},
  willDrawing: false,
  setWillDrawing: () => {},
  onDrawStart: () => {},
  onDrawing: () => {},
  onDrawEnd: () => {},
  points: [],

  stage: {} as Konva.Stage,
  setStage: () => {},
  layer: {} as Konva.Layer,
  setLayer: () => {},
};

const ShapesContext = createContext<IShapesContext>(defaultValue);

const ShapesProvider = ({ children }: {
  children: ReactNode,
}) => {
  const {
    shapes, updateShape, addShape,
    removeShape, duplicateShape, toForward, toBackward, getShapeById,
  } = useShapes();

  const {
    selected, onDragStart, onDragEnd, unselect, setSelected,
    draggable, setDraggable,
  } = useDraggable({
    updateShape,
  });

  const { focused, setFocused, unfocus } = useFocusable();

  const {
    zoom, canZoomIn, canZoomOut, zoomIn, zoomOut,
  } = useZoom();

  const {
    stage, setStage, layer, setLayer,
  } = useStage();

  const {
    // setModeToEraser, setModeToPen,
    drawing, mode, setDrawing,
    onDrawStart, onDrawing, onDrawEnd, points,
    willDrawing, setWillDrawing,
  } = useDrawing({
    addShape, setSelected,
  });

  const initialState: IShapesContext = {
    shapes,
    selected,
    focused,
    setFocused,
    updateShape,
    addShape,
    removeShape,
    duplicateShape,
    onDragStart,
    onDragEnd,
    draggable,
    setDraggable,
    unselect,
    unfocus,
    setSelected,
    getShapeById,

    toForward,
    toBackward,

    zoom,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,

    setDrawing,
    drawing,
    mode,
    points,
    willDrawing,
    setWillDrawing,
    onDrawEnd,
    onDrawStart,
    onDrawing,

    stage,
    setStage,
    layer,
    setLayer,
  };

  return (
    <ShapesContext.Provider value={initialState}>
      {children}
    </ShapesContext.Provider>
  );
};

const ShapesConsumer = ({ children }: { children: (value) => ReactNode }) => (
  <ShapesContext.Consumer>
    { children }
  </ShapesContext.Consumer>
);

const useShapesContext = () => {
  const context = useContext(ShapesContext);

  return context;
};

export {
  ShapesContext,
  ShapesProvider,
  ShapesConsumer,
  useShapesContext,
};
