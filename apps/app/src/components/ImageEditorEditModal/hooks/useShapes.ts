import React, {
  useContext, useEffect, useState,
} from 'react';

import Konva from 'konva';

import { HistoryContext } from '../context/HistoryContext';

import { useIdCounter } from './useIdCounter';


export function useShapes() {
  const [shapes, setShapes] = useState<Konva.ShapeConfig[]>([]);

  const { generateId } = useIdCounter();

  const {
    saveHistory,
    history,
    index: historyIndex,
  } = useContext(HistoryContext);

  const getShapeById = (id: string) => shapes.find(shape => shape.id === id);

  const updateShape = <T extends Konva.ShapeConfig>(
    config: T & { id: string },
    options: {
      saveHistory: boolean;
    } = {
      saveHistory: true,
    },
  ) => {
    const updated = shapes.map((shape) => {
      console.log({
        ...shape,
        ...config,
      });
      if (shape.id === config.id) {
        return {
          ...shape,
          ...config,
        };
      }
      return shape;
    });

    setShapes(updated);

    if (options.saveHistory) {
      saveHistory(updated);
    }

    return updated;
  };

  const generateShape = <T extends Konva.ShapeConfig>(shape: T) => {
    if ('filters' in shape) {
      // eslint-disable-next-line no-param-reassign
      delete shape.filters;
    }

    let array = [];
    if (shape.type !== 'text') {
      array = [
        Konva.Filters.Brighten,
        Konva.Filters.Contrast,
        Konva.Filters.Pixelate,
      ];
    }

    const defaultColor = '#df4b26';
    let created: Konva.ShapeConfig = {
      id: shape.id ?? generateId(),
      draggable: true,
      shadowBlur: 0,
      brightness: 0,
      blur: 0,
      contrast: 0,
      pixelSize: 1,
      fill: defaultColor,
      filters: [
        Konva.Filters.Blur,
        ...array,
      ],
    };

    switch (shape.type) {
      case 'circle':
      case 'ellipse':
        created = {
          ...created,
          ...shape,
          type: 'ellipse',
          y: shape.y ?? Math.random() * 100,
          x: shape.x ?? Math.random() * 100,
          rotation: shape.rotation ?? 0,
          radiusX: shape.radiusX ?? 50,
          radiusY: shape.radiusY ?? 50,
          fill: shape.fill ?? defaultColor,
        };
        break;

      case 'rectangle':
      case 'rect':
        created = {
          ...created,
          ...shape,
          type: 'rectangle',
          y: shape.y ?? Math.random() * 100,
          x: shape.x ?? Math.random() * 100,
          width: shape.width ?? 200,
          height: shape.height ?? 40,
          fill: 'rgba(255, 255, 255, 0)',
          stroke: shape.fill ?? '#df4b26',
          strokeWidth: 3,
        };
        break;

      case 'text':
        created = {
          ...created,
          ...shape,
          type: 'text',
          rotation: shape.rotation ?? 0,
          y: shape.y ?? Math.random() * 100,
          x: shape.x ?? Math.random() * 100,
          fill: shape.fill ?? '#df4b26',
          text: shape.text ?? 'Double click to edit',
          fontSize: shape.fontSize ?? 28,
          fontStyle: shape.fontStyle ?? 'normal',
          align: shape.align ?? 'left',
          wrap: shape.wrap ?? 'word',
        };
        break;

      case 'line':
        created = {
          ...created,
          stroke: shape.stroke ?? '#df4b26',
          ...shape,
        };
        break;

      case 'stamp':
        created = {
          ...created,
          ...shape,
          y: shape.x ?? Math.random() * 100,
          x: shape.y ?? Math.random() * 100,
          fill: undefined,
        };
        break;

      case 'image':
        created = {
          ...created,
          ...shape,
          y: shape.x ?? Math.random() * 100,
          x: shape.y ?? Math.random() * 100,
          fill: undefined,
        };
        break;

      default:
        break;
    }

    return created;
  };

  const addShape = <T extends Konva.ShapeConfig>(shape: T | T[]) => {
    const created = ((Array.isArray(shape)) ? shape : [shape]).map(option => generateShape(option));
    console.log(shapes);

    setShapes(shapes.concat(created));

    saveHistory(shapes.concat(created));

    return created;
  };

  // HistoryIndex 변하면 history 번째 인덱스꺼 가져와서 변화시키기
  useEffect(() => {
    setShapes(history[historyIndex]);
  }, [history, historyIndex]);

  const toForward = (id: string) => {
    const shape = shapes.find(item => item.id === id);
    if (!shape) return;
    const result = shapes.filter(item => item.id !== id).concat([shape]);
    setShapes(result);
    saveHistory(result);
  };

  const toBackward = (id: string) => {
    const shape = shapes.find(item => item.id === id);
    if (!shape) return;
    const result = [shape].concat(shapes.filter(item => item.id !== id));
    setShapes(result);
    saveHistory(result);
  };

  const removeShape = (id: string) => {
    const shape = shapes.find(item => item.id === id);
    if (!shape) return;
    const result = shapes.filter(item => item.id !== id);
    setShapes(result);
    saveHistory(result);
  };

  const duplicateShape = (id: string): Konva.ShapeConfig => {
    const shape = shapes.find(item => item.id === id);
    const created = {
      ...shape,
      id: generateId(),
      x: shape.x + 10,
      y: shape.y + 10,
    };

    const result = shapes.concat([created]);
    setShapes(result);
    saveHistory(result);

    return created;
  };

  return {
    shapes,

    getShapeById,
    duplicateShape,

    setShapes,
    updateShape,
    addShape,
    removeShape,

    toForward,
    toBackward,
  };
}
