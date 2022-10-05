import type { PhrasingContent } from 'mdast';
import type { Parent } from 'unist';

import { DirectiveType } from './consts.js';


type DirectiveAttributes = Record<string, string>

interface DirectiveFields {
  name: string
  attributes?: DirectiveAttributes
}

export interface TextDirective extends Parent, DirectiveFields {
  type: DirectiveType.Text
  children: PhrasingContent[]
}

export interface LeafDirective extends Parent, DirectiveFields {
  type: DirectiveType.Leaf
  children: PhrasingContent[]
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    [DirectiveType.Text]: TextDirective
  }

  interface BlockContentMap {
    [DirectiveType.Leaf]: LeafDirective
  }
}
