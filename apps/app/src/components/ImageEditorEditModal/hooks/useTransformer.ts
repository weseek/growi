import Konva from 'konva';
import React, { useEffect } from 'react';

export const useTransformer = <T extends Konva.Shape>({
  isSelected,
  ref,
  transformer,
}: {
  isSelected: boolean;
  ref: React.MutableRefObject<T>;
  transformer: React.MutableRefObject<Konva.Transformer>;
}) => {
  useEffect(() => {
    if (isSelected) {
      transformer.current.nodes([ref.current]);
      transformer.current.getLayer().batchDraw();
    }
  }, [isSelected]);
};
