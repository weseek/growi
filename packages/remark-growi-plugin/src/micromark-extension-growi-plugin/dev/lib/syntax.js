/**
 * @typedef {import('micromark-util-types').Extension} Extension
 */

import {codes} from 'micromark-util-symbol/codes.js'
import {directiveContainer} from './directive-container.js'
import {directiveLeaf} from './directive-leaf.js'
import {directiveText} from './directive-text.js'

/**
 * @returns {Extension}
 */
export function directive() {
  return {
    text: {[codes.colon]: directiveText},
    flow: {[codes.colon]: [directiveContainer, directiveLeaf]}
  }
}
