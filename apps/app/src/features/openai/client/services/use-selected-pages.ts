import { useState, useCallback } from 'react';

import type { IPageHasId } from '@growi/core';

type UseSelectedPages = {
  selectedPages: Map<string, IPageHasId>,
  addPageHandler: (page: IPageHasId) => void,
  removePageHandler: (page: IPageHasId) => void,
}

export const useSelectedPages = (): UseSelectedPages => {
  const [selectedPages, setSelectedPages] = useState<Map<string, IPageHasId>>(new Map());

  const addPageHandler = useCallback((page: IPageHasId) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.set(page._id, page);
      return newMap;
    });
  }, []);

  const removePageHandler = useCallback((page: IPageHasId) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(page._id);
      return newMap;
    });
  }, []);

  return {
    selectedPages,
    addPageHandler,
    removePageHandler,
  };
};
