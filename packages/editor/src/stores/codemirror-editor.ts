import { useMemo, useRef } from 'react';

import { type Extension } from '@codemirror/state';
import { scrollPastEnd } from '@codemirror/view';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { ReactCodeMirrorProps, UseCodeMirror } from '@uiw/react-codemirror';
import type { SWRResponse } from 'swr';

import type { UseCodeMirrorEditor } from '../services';
import { useCodeMirrorEditor } from '../services';


const isValid = (u: UseCodeMirrorEditor) => {
  return u.state != null && u.view != null;
};

const isDeepEquals = <T extends object>(obj1: T, obj2: T): boolean => {
  const typedKeys = Object.keys(obj1) as (keyof typeof obj1)[];
  return typedKeys.every(key => obj1[key] === obj2[key]);
};


const defaultExtensionsMain: Extension[] = [
  scrollPastEnd(),
];

export const useCodeMirrorEditorMain = (container?: HTMLDivElement | null, props?: ReactCodeMirrorProps): SWRResponse<UseCodeMirrorEditor> => {
  const ref = useRef<UseCodeMirrorEditor>();
  const currentData = ref.current;

  const mergedProps = useMemo<UseCodeMirror>(() => {
    return {
      ...props,
      container,
      extensions: [
        ...(props?.extensions ?? []),
        ...defaultExtensionsMain,
      ],
    };
  }, [container, props]);

  const newData = useCodeMirrorEditor(mergedProps);

  const shouldUpdate = props != null && (
    currentData == null
    || (isValid(newData) && !isDeepEquals(currentData, newData))
  );

  if (shouldUpdate) {
    ref.current = newData;
  }

  return useSWRStatic('codeMirrorEditorMain', shouldUpdate ? newData : undefined);
};
