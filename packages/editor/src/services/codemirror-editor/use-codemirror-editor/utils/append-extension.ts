import { useCallback } from 'react';

import { Compartment, Extension, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

type CleanupFunction = () => void;
export type AppendExtension = (extension: Extension) => CleanupFunction | undefined;

export const useAppendExtension = (view?: EditorView): AppendExtension => {

  const { dispatch } = view ?? {};

  return useCallback((extension) => {
    const compartment = new Compartment();
    dispatch?.({
      effects: StateEffect.appendConfig.of(
        compartment.of(extension),
      ),
    });

    // return cleanup function
    return () => {
      dispatch?.({
        effects: compartment.reconfigure([]),
      });
    };
  }, [dispatch]);

};
