import React, { useRef, useEffect } from 'react';

import Konva from 'konva';
import { Line, Transformer } from 'react-konva';
import { Portal } from 'react-konva-utils';

import { useShapeCache, useTransformer } from '../hooks';

export const TransformableLine = ({
  onDragStart,
  onDragEnd,
  onClick,
  onTransform,
  isSelected,
  mode,
  points,
  ...props
}: {
    onDragStart: (shape: Konva.ShapeConfig) => void;
    onDragEnd: (e: any) => void;
    onTransform: (e: any) => void;
    onClick: (e: any) => void;
    isSelected: boolean;
    mode: string;
    points: Konva.LineConfig['points'];
    [key: string]: any;
}) => {
  const lineRef = useRef<Konva.Line>();
  const transformerRef = useRef<Konva.Transformer>();

  useTransformer({
    isSelected,
    ref: lineRef,
    transformer: transformerRef,
  });

  useShapeCache({
    ref: lineRef,
    deps: [isSelected, props],
  });

  return (
    <>
      <Line
        ref={lineRef}
        {...props}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={e => onDragEnd(e)}
        points={points}
        strokeWidth={5}
        tension={0.5}
        lineCap="round"
        // globalCompositeOperation={
        // mode === 'eraser' ? 'destination-out' : 'source-over'
        // }
        onTransformEnd={() => {
          const node = lineRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          const scaledPoints = lineRef.current.points().map((point, index) => {
            // x 좌표
            if (index % 2 === 0) {
              return point * scaleX;
            }
            // y 좌표
            return point * scaleY;
          });

          onTransform({
            ...props,
            rotation: node.rotation(),
            points: scaledPoints,
            strokeWidth: node.strokeWidth() * Math.max(scaleX, scaleY),
            x: node.x(),
            y: node.y(),
            width: (node.width() * scaleX),
            height: (node.height() * scaleY),
          });
        }}
      />

      {isSelected && (
        <Portal selector=".top-layer" enabled={isSelected}>
          <Transformer
            ref={transformerRef}
          />
        </Portal>
      )}
    </>
  );
};
