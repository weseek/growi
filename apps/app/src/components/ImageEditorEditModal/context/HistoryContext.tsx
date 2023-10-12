import React, {
  createContext, ReactNode, useMemo, useState
} from 'react';
import { ShapesHistory } from '@types';

const useHistory = () => {
  const [history, setHistory] = useState<ShapesHistory[]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const saveHistory = (state: ShapesHistory) => {
    setHistory([...history.slice(0, historyIndex + 1), state]);

    setHistoryIndex(historyIndex + 1);
  };

  const canUndo = useMemo(
    () => history.length > 0 && historyIndex > 0,
    [history, historyIndex]
  );

  const canRedo = useMemo(
    () => history.length > 0 && historyIndex < history.length - 1,
    [history, historyIndex]
  );

  const currentHistory = useMemo(
    () => history[historyIndex],
    [history, historyIndex]
  );

  const undo = () => {
    if (!canUndo) {
      return;
    }

    if (historyIndex === 0) {
      return;
    }

    setHistoryIndex(historyIndex - 1);
  };

  const redo = () => {
    if (!canRedo) {
      return;
    }
    if (historyIndex === history.length - 1) {
      return;
    }

    setHistoryIndex(historyIndex + 1);
  };

  return {
    history,
    historyIndex,
    currentHistory,
    saveHistory,
    setHistoryIndex,
    setHistory,
    canUndo,
    canRedo,
    undo,
    redo,
  };
};

interface IHistoryContext {
  history: ShapesHistory[];
  index: number | null;
  canRedo: boolean;
  canUndo: boolean;
  redo: () => void;
  undo: () => void;
  saveHistory: (state) => void;
}

const HistoryContext = createContext<IHistoryContext>({
  history: [],
  index: 0,
  canRedo: false,
  canUndo: false,
  redo: () => {},
  undo: () => {},
  saveHistory: (_state: ShapesHistory) => {},
});

const HistoryProvider = ({ children }: {children: ReactNode}) => {
  const {
    history, historyIndex, redo, undo, saveHistory, canRedo, canUndo,
  } = useHistory();

  const initialState: IHistoryContext = {
    history,
    index: historyIndex,
    canRedo,
    canUndo,
    redo,
    undo,
    saveHistory,
  };

  return (
    <HistoryContext.Provider value={initialState}>
      {children}
    </HistoryContext.Provider>
  );
};

export { HistoryContext, HistoryProvider };
