import { useMemo, useRef } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';
import deepmerge from 'ts-deepmerge';

import type { UseCodeMirrorEditor } from '../services';
import { useCodeMirrorEditor } from '../services';


const isValid = (u: UseCodeMirrorEditor) => {
  return u.state != null && u.view != null;
};

const isDeepEquals = <T extends object>(obj1: T, obj2: T): boolean => {
  const typedKeys = Object.keys(obj1) as (keyof typeof obj1)[];
  return typedKeys.every(key => obj1[key] === obj2[key]);
};


export const useCodeMirrorEditorIsolated = (
    key: string | null, container?: HTMLDivElement | null, props?: ReactCodeMirrorProps,
): SWRResponse<UseCodeMirrorEditor> => {

  const ref = useRef<UseCodeMirrorEditor>();
  const currentData = ref.current;

  const swrKey = key != null ? `codeMirrorEditor_${key}` : null;
  const mergedProps = useMemo<UseCodeMirror>(() => {
    return deepmerge(
      props ?? {},
      {
        container,
      },
    );
  }, [container, props]);

  const newData = useCodeMirrorEditor(mergedProps);

  const shouldUpdate = swrKey != null && container != null && props != null && (
    currentData == null
    || (isValid(newData) && !isDeepEquals(currentData, newData))
  );

  if (shouldUpdate) {
    ref.current = newData;
    // eslint-disable-next-line no-console
    console.info('Initializing codemirror for main');
  }

  return useSWRStatic(swrKey, shouldUpdate ? newData : undefined);
};
