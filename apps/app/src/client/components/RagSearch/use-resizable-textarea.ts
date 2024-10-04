import type { ChangeEventHandler } from 'react';
import { useCallback } from 'react';

export const useResizableTextarea = (): { register: () => { onChange: ChangeEventHandler<HTMLTextAreaElement> } } => {

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
    // auto resize
    // refs: https://zenn.dev/soma3134/articles/1e2fb0eab75b2d
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight + 4}px`;
  }, []);

  return {
    register: () => {
      return { onChange };
    },
  };
};
