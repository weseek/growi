import Konva from 'konva';
import { useState } from 'react';

export const useStage = () => {
  const [stage, setStage] = useState<Konva.Stage>();
  const [layer, setLayer] = useState<Konva.Layer>();

  return {
    stage, setStage, layer, setLayer,
  };
};
