import { useMemo, useRef } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';
import deepmerge from 'ts-deepmerge';

import { type UseCodeMirrorEditor, useCodeMirrorEditor } from '../services';


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

  const cmPropsRef = useRef<ReactCodeMirrorProps>();
  const currentCmPropsData = cmPropsRef.current;

  const swrKey = key != null ? `codeMirrorEditor_${key}` : null;
  const mergedProps = useMemo<UseCodeMirror>(() => deepmerge(
    { container },
    props ?? {},
  ), [container, props]);

  const newData = useCodeMirrorEditor(mergedProps);

  // eslint-disable-next-line max-len
  const shouldUpdateProps = (props != null && currentCmPropsData == null) || (props != null && currentCmPropsData != null && !isDeepEquals(currentCmPropsData, props));

  // eslint-disable-next-line max-len
  const shouldUpdate = swrKey != null && container != null && (currentData == null || (isValid(newData) && !isDeepEquals(currentData, newData)) || shouldUpdateProps);

  if (shouldUpdate) {
    ref.current = newData;
    cmPropsRef.current = props;
  }

  return useSWRStatic(swrKey, shouldUpdate ? newData : undefined);
};
