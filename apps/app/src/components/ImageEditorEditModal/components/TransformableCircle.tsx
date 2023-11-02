import React, { useRef } from 'react';
import { Ellipse, Transformer } from 'react-konva';
import { Portal } from 'react-konva-utils';
import Konva from 'konva';

import { useShapeCache, useTransformer } from '../hooks';

export const TransformableCircle = ({
  onDragStart,
  onDragEnd,
  onClick,
  onTransform,
  isSelected,
  ...props
}: {
    onDragStart: (shape: Konva.ShapeConfig) => void;
    onDragEnd: (e: any) => void;
    onTransform: (e: any) => void;
    onClick: (e: any) => void;
    isSelected: boolean;
    radiusX: number;
    radiusY: number;
    [key: string]: any;
}) => {
  const circleRef = useRef<Konva.Ellipse>();
  const transformerRef = useRef<Konva.Transformer>();

  useTransformer({
    isSelected,
    ref: circleRef,
    transformer: transformerRef,
  });

  useShapeCache({
    ref: circleRef,
    deps: [isSelected, props],
  });

  const snaps = Array(24).fill(0).map((_, i) => i * 15);

  return (
    <>
      <Ellipse
        ref={circleRef}
        {...props}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={(e) => onDragEnd(e)}
        onTransformEnd={(e) => {
          const node = circleRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          onTransform({
            ...props,
            rotation: node.rotation(),
            x: node.x(),
            y: node.y(),
            radiusX: (node.width() * scaleX) / 2,
            radiusY: (node.height() * scaleY) / 2,
          });
        }}
      />

      {isSelected && (
        <Portal selector=".top-layer" enabled={isSelected}>
          <Transformer
            ref={transformerRef}
            // TODO: 키 리스닝하게 하기
            rotationSnaps={snaps}
            rotationSnapTolerance={15 / 2}
          />
        </Portal>
      )}
    </>
  );
};
