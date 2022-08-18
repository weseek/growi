/**
 * @typedef {import('micromark-util-types').Construct} Construct
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 */

import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding } from 'micromark-util-character';
import { codes } from 'micromark-util-symbol/codes.js';
import { types } from 'micromark-util-symbol/types.js';
import { ok as assert } from 'uvu/assert';

import { factoryAttributes } from './factory-attributes.js';
import { factoryLabel } from './factory-label.js';
import { factoryName } from './factory-name.js';

/** @type {Construct} */
export const directiveLeaf = { tokenize: tokenizeDirectiveLeaf };

const label = { tokenize: tokenizeLabel, partial: true };
const attributes = { tokenize: tokenizeAttributes, partial: true };

/** @type {Tokenizer} */
function tokenizeDirectiveLeaf(effects, ok, nok) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  return start;

  // /** @type {State} */
  // function start(code) {
  //   assert(code === codes.dollarSign, 'expected `$`');
  //   effects.enter('directiveLeaf');
  //   effects.enter('directiveLeafSequence');
  //   effects.consume(code);
  //   return inStart;
  // }

  // /** @type {State} */
  // function inStart(code) {
  //   if (code === codes.dollarSign) {
  //     effects.consume(code);
  //     effects.exit('directiveLeafSequence');
  //     return factoryName.call(
  //       self,
  //       effects,
  //       afterName,
  //       nok,
  //       'directiveLeafName',
  //     );
  //   }

  //   return nok(code);
  // }

  // /** @type {State} */
  // function afterName(code) {
  //   return code === codes.leftSquareBracket
  //     ? effects.attempt(label, afterLabel, afterLabel)(code)
  //     : afterLabel(code);
  // }

  /** @type {State} */
  function start(code) {
    assert(code === codes.dollarSign, 'expected `$`');
    effects.enter('directiveLeaf');
    effects.consume(code);
    return factoryName.call(self, effects, afterName, nok, 'directiveLeafName');
  }

  /** @type {State} */
  function afterName(code) {
    // eslint-disable-next-line no-nested-ternary
    return code === codes.dollarSign
      ? nok(code)
      : code === codes.leftSquareBracket
        ? effects.attempt(label, afterLabel, afterLabel)(code)
        : afterLabel(code);
  }

  /** @type {State} */
  function afterLabel(code) {
    return code === codes.leftParenthesis
      ? effects.attempt(attributes, afterAttributes, afterAttributes)(code)
      : afterAttributes(code);
  }

  /** @type {State} */
  function afterAttributes(code) {
    return factorySpace(effects, end, types.whitespace)(code);
  }

  /** @type {State} */
  function end(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit('directiveLeaf');
      return ok(code);
    }

    return nok(code);
  }
}

/** @type {Tokenizer} */
function tokenizeLabel(effects, ok, nok) {
  // Always a `[`
  return factoryLabel(
    effects,
    ok,
    nok,
    'directiveLeafLabel',
    'directiveLeafLabelMarker',
    'directiveLeafLabelString',
    true,
  );
}

/** @type {Tokenizer} */
function tokenizeAttributes(effects, ok, nok) {
  // Always a `{`
  return factoryAttributes(
    effects,
    ok,
    nok,
    'directiveLeafAttributes',
    'directiveLeafAttributesMarker',
    'directiveLeafAttribute',
    'directiveLeafAttributeId',
    'directiveLeafAttributeClass',
    'directiveLeafAttributeName',
    'directiveLeafAttributeInitializerMarker',
    'directiveLeafAttributeValueLiteral',
    'directiveLeafAttributeValue',
    'directiveLeafAttributeValueMarker',
    'directiveLeafAttributeValueData',
    true,
  );
}
