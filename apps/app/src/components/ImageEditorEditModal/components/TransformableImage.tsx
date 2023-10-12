import React, { useRef, useEffect, useState } from 'react';

import Konva from 'konva';
import { Image, Transformer } from 'react-konva';
import { Portal } from 'react-konva-utils';
import useImage from 'use-image';

import { useShapeCache, useTransformer } from '../hooks';

export const TransformableImage = ({
  onDragStart,
  onDragEnd,
  onClick,
  onTransform,
  isSelected,
  maxWidth,
  src,
  ...props
}: {
  onDragStart: (shape: Konva.ShapeConfig) => void;
  onDragEnd: (e: any) => void;
  onTransform: (e: any) => void;
  onClick: (e: any) => void;
  isSelected: boolean;
  src: Konva.ImageConfig['image'];
  maxWidth: number;
  [key: string]: any;
}) => {
  const imageRef = useRef<Konva.Image>();
  const transformerRef = useRef<Konva.Transformer>();

  useTransformer({
    isSelected,
    ref: imageRef,
    transformer: transformerRef,
  });

  useShapeCache({
    ref: imageRef,
    deps: [isSelected, props],
  });

  return (
    <>
      <Image
        {...props}
        image={src}
        ref={imageRef}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={e => onDragEnd(e)}
        // width={(src.width as number) * ratio}
        // height={(src.height as number) * ratio}
        onTransformEnd={() => {
          const node = imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          onTransform({
            ...props,
            rotation: node.rotation(),
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
