import { TextlintKernel, TextlintKernelRule, TextlintRuleOptions } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';
import textlintRuleTextlintRuleNoInvalidControlCharacter from '@textlint-rule/textlint-rule-no-invalid-control-character';
import textlintRuleTextlintRuleNoUnmatchedPair from '@textlint-rule/textlint-rule-no-unmatched-pair';
import textlintRuleCommonMisspellings from 'textlint-rule-common-misspellings';
import textlintRuleDateWeekdayMismatch from 'textlint-rule-date-weekday-mismatch';
import textlintRuleEnCapitalization from 'textlint-rule-en-capitalization';
import textlintRuleGinger from 'textlint-rule-ginger';
import textlintRuleJaHiraganaKeishikimeishi from 'textlint-rule-ja-hiragana-keishikimeishi';
import textlintRuleJaNoAbusage from 'textlint-rule-ja-no-abusage';
import textlintRuleJaNoInappropriateWords from 'textlint-rule-ja-no-inappropriate-words';
import textlintRuleJaNoMixedPeriod from 'textlint-rule-ja-no-mixed-period';
import textlintRuleJaNoRedundantExpression from 'textlint-rule-ja-no-redundant-expression';
import textlintRuleJaUnnaturalAlphabet from 'textlint-rule-ja-unnatural-alphabet';
import textlintRuleMaxComma from 'textlint-rule-max-comma';
import textlintRuleMaxKanjiContinuousLen from 'textlint-rule-max-kanji-continuous-len';
import textlintRuleMaxTen from 'textlint-rule-max-ten';
import textlintRuleNoDeadLink from 'textlint-rule-no-dead-link';
import textlintRuleNoDoubleNegativeJa from 'textlint-rule-no-double-negative-ja';
import textlintRuleNoDoubledConjunction from 'textlint-rule-no-doubled-conjunction';
import textlintRuleNoDoubledJoshi from 'textlint-rule-no-doubled-joshi';
import textlintRuleNoDroppingTheRa from 'textlint-rule-no-dropping-the-ra';
import textlintRuleNoHankakuKana from 'textlint-rule-no-hankaku-kana';
import textlintRuleNoKangxiRadicals from 'textlint-rule-no-kangxi-radicals';
import textlintRuleNoMixedZenkakuAndHankakuAlphabet from 'textlint-rule-no-mixed-zenkaku-and-hankaku-alphabet';
import textlintRuleNoNfd from 'textlint-rule-no-nfd';
import textlintRuleNoSurrogatePair from 'textlint-rule-no-surrogate-pair';
import textlintRuleNoZeroWidthSpaces from 'textlint-rule-no-zero-width-spaces';
import textlintRulePeriodInListItem from 'textlint-rule-period-in-list-item';
import textlintRulePreferTariTari from 'textlint-rule-prefer-tari-tari';
import textlintRuleSentenceLength from 'textlint-rule-sentence-length';
import textlintRuleTerminology from 'textlint-rule-terminology';
import textlintRuleUseSiUnits from 'textlint-rule-use-si-units';

import { AsyncLinter, Annotation } from 'codemirror/addon/lint/lint';
import { loggerFactory } from './utils/logger';

type RulesConfigObj = {
  name: string,
  options?: unknown,
}

type RuleExtension = {
  ext: string
}

const ruleModulesList = {
  'textlint-rule-no-invalid-control-character': textlintRuleTextlintRuleNoInvalidControlCharacter,
  'textlint-rule-no-unmatched-pair': textlintRuleTextlintRuleNoUnmatchedPair,
  'textlint-rule-common-misspellings': textlintRuleCommonMisspellings,
  'textlint-rule-date-weekday-mismatch': textlintRuleDateWeekdayMismatch,
  'textlint-rule-en-capitalization': textlintRuleEnCapitalization,
  'textlint-rule-ginger': textlintRuleGinger,
  'textlint-rule-ja-hiragana-keishikimeishi': textlintRuleJaHiraganaKeishikimeishi,
  'textlint-rule-ja-no-abusage': textlintRuleJaNoAbusage,
  'textlint-rule-ja-no-inappropriate-words': textlintRuleJaNoInappropriateWords,
  'textlint-rule-ja-no-mixed-period': textlintRuleJaNoMixedPeriod,
  'textlint-rule-ja-no-redundant-expression': textlintRuleJaNoRedundantExpression,
  'textlint-rule-ja-unnatural-alphabet': textlintRuleJaUnnaturalAlphabet,
  'textlint-rule-max-comma': textlintRuleMaxComma,
  'textlint-rule-max-kanji-continuous-len': textlintRuleMaxKanjiContinuousLen,
  'textlint-rule-max-ten': textlintRuleMaxTen,
  'textlint-rule-no-dead-link': textlintRuleNoDeadLink,
  'textlint-rule-no-double-negative-ja': textlintRuleNoDoubleNegativeJa,
  'textlint-rule-no-doubled-conjunction': textlintRuleNoDoubledConjunction,
  'textlint-rule-no-doubled-joshi': textlintRuleNoDoubledJoshi,
  'textlint-rule-no-dropping-the-ra': textlintRuleNoDroppingTheRa,
  'textlint-rule-no-hankaku-kana': textlintRuleNoHankakuKana,
  'textlint-rule-no-kangxi-radicals': textlintRuleNoKangxiRadicals,
  'textlint-rule-no-mixed-zenkaku-and-hankaku-alphabet': textlintRuleNoMixedZenkakuAndHankakuAlphabet,
  'textlint-rule-no-nfd': textlintRuleNoNfd,
  'textlint-rule-no-surrogate-pair': textlintRuleNoSurrogatePair,
  'textlint-rule-no-zero-width-spaces': textlintRuleNoZeroWidthSpaces,
  'textlint-rule-period-in-list-item': textlintRulePeriodInListItem,
  'textlint-rule-prefer-tari-tari': textlintRulePreferTariTari,
  'textlint-rule-sentence-length': textlintRuleSentenceLength,
  'textlint-rule-terminology': textlintRuleTerminology,
  'textlint-rule-use-si-units': textlintRuleUseSiUnits,
};

const logger = loggerFactory('growi:codemirror:codemirror-textlint');
const kernel = new TextlintKernel();
const textlintOption: TextlintRuleOptions<RuleExtension> = {
  ext: '.md',
  plugins: [
    {
      pluginId: 'markdown',
      plugin: require('textlint-plugin-markdown'),
    },
  ],
};

const createSetupRules = (rules, ruleOptions): TextlintKernelRule[] => (
  Object.keys(rules).map(ruleName => (
    {
      ruleId: ruleName,
      rule: rules[ruleName],
      options: ruleOptions[ruleName],
    }
  ))
);


export const createValidator = (rulesConfigArray: RulesConfigObj[]): AsyncLinter<RulesConfigObj[]> => {

  const filteredConfigArray = rulesConfigArray
    .filter((rule) => {
      if (ruleModulesList[rule.name] == null) {
        logger.error(`Textlint rule ${rule.name} is not installed`);
      }
      return ruleModulesList[rule.name] != null;
    });

  const rules = filteredConfigArray
    .reduce((rules, rule) => {
      rules[rule.name] = ruleModulesList[rule.name];
      return rules;
    }, {});

  const rulesOption = filteredConfigArray
    .reduce((rules, rule) => {
      rules[rule.name] = rule.options || {};
      return rules;
    }, {});

  Object.assign(
    textlintOption,
    { rules: createSetupRules(rules, rulesOption) },
  );


  return (text, callback) => {
    if (!text) {
      callback([]);
      return;
    }
    kernel
      .lintText(text, textlintOption)
      .then((result) => {
        const lintMessages = result.messages;
        const lintErrors: Annotation[] = lintMessages.map(textlintToCodeMirror);
        callback(lintErrors);
      });
  };
};
