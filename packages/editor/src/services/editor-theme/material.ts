// Ref: https://github.com/craftzdog/cm6-themes/blob/main/packages/material-dark/src/index.ts
import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Auther: stephen-liu-fipo
const base00 = '#2e3235',
  base01 = '#505d64',
  base02 = '#606f7a',
  base03 = '#707d8b',
  base04 = '#a0a4ae',
  base05 = '#bdbdbd',
  base06 = '#e0e0e0',
  base07 = '#fdf6e3',
  base_red = '#ff5f52',
  base_deeporange = '#ff6e40',
  base_pink = '#fa5788',
  base_yellow = '#facf4e',
  base_orange = '#ffad42',
  base_cyan = '#56c8d8',
  base_indigo = '#7186f0',
  base_purple = '#cf6edf',
  base_green = '#6abf69',
  base_lightgreen = '#99d066',
  base_teal = '#4ebaaa'

const invalid = base_red,
  // Adjust color
  darkBackground = '#36383a',
  // Adjust color
  highlightBackground = '#44494d',
  background = base00,
  tooltipBackground = base01,
  selection = base01,
  // Change color
  cursor = base05

/// The editor theme styles for Material Dark.
export const materialDarkTheme = EditorView.theme(
  {
    '&': {
      color: base05,
      backgroundColor: background
    },

    '.cm-content': {
      caretColor: cursor
    },

    '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: selection },

    '.cm-panels': { backgroundColor: darkBackground, color: base03 },
    '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
    '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

    '.cm-searchMatch': {
      outline: `1px solid ${base_yellow}`,
      backgroundColor: 'transparent'
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: highlightBackground
    },

    '.cm-activeLine': { backgroundColor: highlightBackground },
    '.cm-selectionMatch': {
      backgroundColor: darkBackground,
      outline: `1px solid ${base_teal}`
    },

    '&.cm-focused .cm-matchingBracket': {
      color: base06,
      outline: `1px solid ${base_teal}`
    },

    '&.cm-focused .cm-nonmatchingBracket': {
      color: base_red
    },

    '.cm-gutters': {
      backgroundColor: base00,
      borderRight: '1px solid #4f5b66',
      color: base02
    },

    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
      color: base07
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd'
    },

    '.cm-tooltip': {
      border: 'none',
      backgroundColor: tooltipBackground
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent'
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: highlightBackground,
        color: base03
      }
    }
  },
  { dark: true }
)

/// The highlighting style for code in the Material Dark theme.
export const materialDarkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: base_purple },
  {
    tag: [t.name, t.deleted, t.character, t.macroName],
    color: base_cyan
  },
  { tag: [t.propertyName], color: base_yellow },
  { tag: [t.variableName], color: base05 },
  { tag: [t.function(t.variableName)], color: base_cyan },
  { tag: [t.labelName], color: base_purple },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: base_yellow
  },
  { tag: [t.definition(t.name), t.separator], color: base_pink },
  { tag: [t.brace], color: base_purple },
  {
    tag: [t.annotation],
    color: invalid
  },
  {
    tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: base_orange
  },
  {
    tag: [t.typeName, t.className],
    color: base_orange
  },
  {
    tag: [t.operator, t.operatorKeyword],
    color: base_indigo
  },
  {
    tag: [t.tagName],
    color: base_deeporange
  },
  {
    tag: [t.squareBracket],
    color: base_red
  },
  {
    tag: [t.angleBracket],
    color: base02
  },
  {
    tag: [t.attributeName],
    color: base05
  },
  {
    tag: [t.regexp],
    color: invalid
  },
  {
    tag: [t.quote],
    color: base_green
  },
  { tag: [t.string], color: base_lightgreen },
  {
    tag: t.link,
    color: base_cyan,
    textDecoration: 'underline',
    textUnderlinePosition: 'under'
  },
  {
    tag: [t.url, t.escape, t.special(t.string)],
    color: base_yellow
  },
  { tag: [t.meta], color: base03 },
  { tag: [t.comment], color: base03, fontStyle: 'italic' },
  { tag: t.monospace, color: base05 },
  { tag: t.strong, fontWeight: 'bold', color: base_red },
  { tag: t.emphasis, fontStyle: 'italic', color: base_lightgreen },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.heading, fontWeight: 'bold', color: base_yellow },
  { tag: t.heading1, fontWeight: 'bold', color: base_yellow },
  {
    tag: [t.heading2, t.heading3, t.heading4],
    fontWeight: 'bold',
    color: base_yellow
  },
  {
    tag: [t.heading5, t.heading6],
    color: base_yellow
  },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: base_cyan },
  {
    tag: [t.processingInstruction, t.inserted],
    color: base_red
  },
  {
    tag: [t.contentSeparator],
    color: base_cyan
  },
  { tag: t.invalid, color: base02, borderBottom: `1px dotted ${base_red}` }
])

/// Extension to enable the Material Dark theme (both the editor theme and
/// the highlight style).
export const materialDark: Extension = [
  materialDarkTheme,
  syntaxHighlighting(materialDarkHighlightStyle)
]
