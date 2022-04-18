import textlintRuleNoUnmatchedPair from '@textlint-rule/textlint-rule-no-unmatched-pair';
import { TextlintKernel, TextlintKernelRule, TextlintRuleOptions } from '@textlint/kernel';
import { AsyncLinter, Annotation } from 'codemirror/addon/lint/lint';
import textlintToCodeMirror from 'textlint-message-to-codemirror';
import textlintRuleCommonMisspellings from 'textlint-rule-common-misspellings';
import textlintRuleDateWeekdayMismatch from 'textlint-rule-date-weekday-mismatch';
// import textlintRuleEnCapitalization from 'textlint-rule-en-capitalization';  // omit because en-pos package is too big
import textlintRuleJaHiraganaKeishikimeishi from 'textlint-rule-ja-hiragana-keishikimeishi';
import textlintRuleJaNoAbusage from 'textlint-rule-ja-no-abusage';
import textlintRuleJaNoInappropriateWords from 'textlint-rule-ja-no-inappropriate-words';
import textlintRuleJaNoMixedPeriod from 'textlint-rule-ja-no-mixed-period';
import textlintRuleJaNoRedundantExpression from 'textlint-rule-ja-no-redundant-expression';
import textlintRuleJaUnnaturalAlphabet from 'textlint-rule-ja-unnatural-alphabet';
import textlintRuleMaxComma from 'textlint-rule-max-comma';
import textlintRuleMaxKanjiContinuousLen from 'textlint-rule-max-kanji-continuous-len';
import textlintRuleMaxTen from 'textlint-rule-max-ten';
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
import textlintRuleUseSiUnits from 'textlint-rule-use-si-units';

import { loggerFactory } from './utils/logger';

type RulesConfigObj = {
  name: string,
  options?: unknown,
  isEnabled?: boolean,
}

type RuleExtension = {
  ext: string
}

const ruleModulesList = {
  'no-unmatched-pair': textlintRuleNoUnmatchedPair,
  'common-misspellings': textlintRuleCommonMisspellings,
  'date-weekday-mismatch': textlintRuleDateWeekdayMismatch,
  // 'en-capitalization': textlintRuleEnCapitalization, // omit because en-pos package is too big
  'ja-hiragana-keishikimeishi': textlintRuleJaHiraganaKeishikimeishi,
  'ja-no-abusage': textlintRuleJaNoAbusage,
  'ja-no-inappropriate-words': textlintRuleJaNoInappropriateWords,
  'ja-no-mixed-period': textlintRuleJaNoMixedPeriod,
  'ja-no-redundant-expression': textlintRuleJaNoRedundantExpression,
  'ja-unnatural-alphabet': textlintRuleJaUnnaturalAlphabet,
  'max-comma': textlintRuleMaxComma,
  'max-kanji-continuous-len': textlintRuleMaxKanjiContinuousLen,
  'max-ten': textlintRuleMaxTen,
  'no-double-negative-ja': textlintRuleNoDoubleNegativeJa,
  'no-doubled-conjunction': textlintRuleNoDoubledConjunction,
  'no-doubled-joshi': textlintRuleNoDoubledJoshi,
  'no-dropping-the-ra': textlintRuleNoDroppingTheRa,
  'no-hankaku-kana': textlintRuleNoHankakuKana,
  'no-kangxi-radicals': textlintRuleNoKangxiRadicals,
  'no-mixed-zenkaku-and-hankaku-alphabet': textlintRuleNoMixedZenkakuAndHankakuAlphabet,
  'no-nfd': textlintRuleNoNfd,
  'no-surrogate-pair': textlintRuleNoSurrogatePair,
  'no-zero-width-spaces': textlintRuleNoZeroWidthSpaces,
  'period-in-list-item': textlintRulePeriodInListItem,
  'prefer-tari-tari': textlintRulePreferTariTari,
  'sentence-length': textlintRuleSentenceLength,
  'use-si-units': textlintRuleUseSiUnits,
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


export const createValidator = (rulesConfigArray: RulesConfigObj[] | null): AsyncLinter<RulesConfigObj[] | null> => {
  if (rulesConfigArray != null) {
    const filteredConfigArray = rulesConfigArray
      .filter((rule) => {
        if (ruleModulesList[rule.name] == null) {
          logger.error(`Textlint rule ${rule.name} is not installed`);
        }
        return (ruleModulesList[rule.name] != null && rule.isEnabled !== false);
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
  }

  const defaultSetupRules: TextlintKernelRule[] = Object.entries(ruleModulesList)
    .map(ruleName => ({
      ruleId: ruleName[0],
      rule: ruleName[1],
    }));

  if (rulesConfigArray == null) {
    Object.assign(
      textlintOption,
      { rules: defaultSetupRules },
    );
  }

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
