import { useState, useCallback, useEffect } from 'react';

import type { SelectedPage } from '../../interfaces/selected-page';

type UseSelectedPages = {
  selectedPages: Map<string, SelectedPage>,
  addPage: (page: SelectedPage) => void,
  removePage: (page: SelectedPage) => void,
  clearPages: () => void,
}

export const useSelectedPages = (initialPages?: SelectedPage[]): UseSelectedPages => {
  const [selectedPages, setSelectedPages] = useState<Map<string, SelectedPage>>(new Map());

  useEffect(() => {
    if (initialPages) {
      const initialMap = new Map<string, SelectedPage>();
      initialPages.forEach((page) => {
        if (page.path != null) {
          initialMap.set(page.path, page);
        }
      });
      setSelectedPages(initialMap);
    }
  }, [initialPages]);

  const addPage = useCallback((page: SelectedPage) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      if (page.path != null) {
        newMap.set(page.path, page);
      }
      return newMap;
    });
  }, []);

  const removePage = useCallback((page: SelectedPage) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      if (page.path != null) {
        newMap.delete(page.path);
      }
      return newMap;
    });
  }, []);

  const clearPages = useCallback(() => {
    setSelectedPages(new Map());
  }, []);

  return {
    selectedPages,
    addPage,
    removePage,
    clearPages,
  };
};
