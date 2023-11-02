import Konva from 'konva';
import React, { useEffect } from 'react';

export const useShapeCache = <T extends Konva.Shape>({
  ref,
  deps,
}: {
  ref: React.MutableRefObject<T>
  deps: any[]
}) => {
  useEffect(() => {
    ref.current.cache();
  }, [...deps]);
};
