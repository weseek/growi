import { useMemo, useRef } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
// import { deepEquals } from '@growi/core/dist/utils';
import type { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';
import deepmerge from 'ts-deepmerge';

import { type UseCodeMirrorEditor, useCodeMirrorEditor } from '../services';


// --- revert degradation by https://github.com/weseek/growi/commit/a62f4e5e98dfd089a1bbda1a0291d78978aaabc8 temporarily
// const { isDeepEquals } = deepEquals;
const isDeepEquals = <T extends object>(obj1: T, obj2: T): boolean => {
  const typedKeys = Object.keys(obj1) as (keyof typeof obj1)[];
  return typedKeys.every(key => obj1[key] === obj2[key]);
};
// ---


const isValid = (u: UseCodeMirrorEditor) => {
  return u.state != null && u.view != null;
};

export const useCodeMirrorEditorIsolated = (
    key: string | null, container?: HTMLDivElement | null, props?: ReactCodeMirrorProps,
): SWRResponse<UseCodeMirrorEditor> => {

  const ref = useRef<UseCodeMirrorEditor>();
  const currentData = ref.current;

  const swrKey = key != null ? `codeMirrorEditor_${key}` : null;
  const mergedProps = useMemo<UseCodeMirror>(() => deepmerge(
    { container },
    props ?? {},
  ), [container, props]);

  const newData = useCodeMirrorEditor(mergedProps);

  const shouldUpdate = swrKey != null && container != null && (
    currentData == null
    || (isValid(newData) && !isDeepEquals(currentData, newData))
  );

  if (shouldUpdate) {
    ref.current = newData;
  }

  return useSWRStatic(swrKey, shouldUpdate ? newData : undefined);
};
