import type { PhrasingContent } from 'mdast';
import type { Parent } from 'unist';

type DirectiveAttributes = Record<string, string>

interface DirectiveFields {
  name: string
  attributes?: DirectiveAttributes
}

export interface TextDirective extends Parent, DirectiveFields {
  type: 'textGrowiPluginDirective'
  children: PhrasingContent[]
}

export interface LeafDirective extends Parent, DirectiveFields {
  type: 'leafGrowiPluginDirective'
  children: PhrasingContent[]
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    textGrowiPluginDirective: TextDirective
  }

  interface BlockContentMap {
    leafGrowiPluginDirective: LeafDirective
  }
}
