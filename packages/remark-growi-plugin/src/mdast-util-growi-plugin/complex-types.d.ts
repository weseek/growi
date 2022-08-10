import type {Parent} from 'unist'
import type {PhrasingContent, BlockContent} from 'mdast'

type DirectiveAttributes = Record<string, string>

interface DirectiveFields {
  name: string
  attributes?: DirectiveAttributes
}

export interface TextDirective extends Parent, DirectiveFields {
  type: 'textDirective'
  children: PhrasingContent[]
}

export interface LeafDirective extends Parent, DirectiveFields {
  type: 'leafDirective'
  children: PhrasingContent[]
}

export interface ContainerDirective extends Parent, DirectiveFields {
  type: 'containerDirective'
  children: BlockContent[]
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    textDirective: TextDirective
  }

  interface BlockContentMap {
    containerDirective: ContainerDirective
    leafDirective: LeafDirective
  }
}
