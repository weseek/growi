import React, { useRef, useEffect, useState } from 'react';

import Konva from 'konva';
import { Image as KonvaImage, Transformer } from 'react-konva';
import { Portal } from 'react-konva-utils';
import useImage from 'use-image';

import { useShapeCache, useTransformer } from '../hooks';

export const TransformableStamp = ({
  onDragStart,
  onDragEnd,
  onClick,
  onTransform,
  isSelected,
  maxWidth,
  ...props
}: {
  onDragStart: (shape: Konva.ShapeConfig) => void;
  onDragEnd: (e: any) => void;
  onTransform: (e: any) => void;
  onClick: (e: any) => void;
  isSelected: boolean;
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

  const stampString = `
  <svg id="_レイヤー_2" data-name="レイヤー 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
    <g id="_レイヤー_1-2" data-name="レイヤー 1">
      <g>
        <circle style={{ fill: '#1acf53' }} cx="25" cy="25" r="25" />
        <path style={{ fill: '#fff' }} d="m20.91,39.53l-11.85-11.91,4.89-4.89,6.96,6.9,16.98-16.92,4.89,4.95-21.87,21.87Z" />
      </g>
    </g>
  </svg>
  `;
  const encodedSrc = 'data:image/svg+xml;base64,ICA8c3ZnIGlkPSJf44Os44Kk44Ok44O8XzIiIGRhdGEtbmFtZT0i44Os44Kk44Ok44O8IDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDUwIDUwIj4KICAgIDxnIGlkPSJf44Os44Kk44Ok44O8XzEtMiIgZGF0YS1uYW1lPSLjg6zjgqTjg6Tjg7wgMSI+CiAgICAgIDxnPgogICAgICAgIDxjaXJjbGUgc3R5bGU9ImZpbGw6ICMxYWNmNTM7IiBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIC8+CiAgICAgICAgPHBhdGggc3R5bGU9ImZpbGw6ICNmZmY7IiBkPSJtMjAuOTEsMzkuNTNsLTExLjg1LTExLjkxLDQuODktNC44OSw2Ljk2LDYuOSwxNi45OC0xNi45Miw0Ljg5LDQuOTUtMjEuODcsMjEuODdaIiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9zdmc+';
  console.log(encodedSrc);
  const image = new Image();
  image.src = encodedSrc;


  return (
    <>
      <KonvaImage
        {...props}
        alt="Stamp"
        image={image}
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
