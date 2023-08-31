import { useCallback } from 'react';

import { Compartment, Extension, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

type CleanupFunctions = () => void;
export type AppendExtensions = (extensions: Extension | Extension[]) => CleanupFunctions | undefined;

export const useAppendExtensions = (view?: EditorView): AppendExtensions => {

  return useCallback((args) => {
    const extensions = Array.isArray(args)
      ? args
      : [args];

    const compartment = new Compartment();
    view?.dispatch({
      effects: extensions.map((extension) => {
        return StateEffect.appendConfig.of(
          compartment.of(extension),
        );
      }),
    });

    // return cleanup function
    return () => {
      view?.dispatch({
        effects: compartment.reconfigure([]),
      });
    };
  }, [view]);

};
