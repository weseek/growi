import Konva from 'konva';
import { useEffect, useState } from 'react';

export const useFilter = ({ selected, updateShape }) => {
  const previewFilter = ({
    type,
  }) => (value) => {
    updateShape({
      id: selected,
      [type]: value,
    }, {
      saveHistory: false,
    });
  };

  const applyFilter = ({
    type,
  }) => (value) => {
    updateShape({
      id: selected,
      [type]: value,
    });
  };

  return {
    applyFilter,
    previewFilter,
  };
};
