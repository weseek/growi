import type { ComponentType } from 'react';

import type { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import type { NormalComponents } from 'react-markdown/lib/complex-types';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import type { PluggableList } from 'unified';

export type RendererOptions = Omit<ReactMarkdownOptions, 'remarkPlugins' | 'rehypePlugins' | 'components' | 'children'> & {
  remarkPlugins: PluggableList,
  rehypePlugins: PluggableList,
  components?:
    | Partial<
        Omit<NormalComponents, keyof SpecialComponents>
        & SpecialComponents
        & {
          [elem: string]: ComponentType<any>,
        }
      >
    | undefined
};
