import { TextlintKernel, TextlintKernelRule, TextlintRuleOptions } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';
import textlintRuleCommonMisspellings from 'textlint-rule-common-misspellings';
import textlintRuleJaHiraganaFukushi from 'textlint-rule-ja-hiragana-fukushi';
import textlintRuleJaHiraganaHojodoushi from 'textlint-rule-ja-hiragana-hojodoushi';
import textlintRuleJaHiraganaKeishikimeishi from 'textlint-rule-ja-hiragana-keishikimeishi';
import textlintRuleJaNoAbusage from 'textlint-rule-ja-no-abusage';
import textlintRuleJaNoInappropriateWords from 'textlint-rule-ja-no-inappropriate-words';
import textlintRuleJaNoMixedPeriod from 'textlint-rule-ja-no-mixed-period';
import textlintRuleJaNoRedundantExpression from 'textlint-rule-ja-no-redundant-expression';
import textlintRuleMaxComma from 'textlint-rule-max-comma';
import textlintRuleMaxKanjiContinuousLen from 'textlint-rule-max-kanji-continuous-len';
import textlintRuleMaxTen from 'textlint-rule-max-ten';
import textlintRuleNoDoubleNegativeJa from 'textlint-rule-no-double-negative-ja';
import textlintRuleNoDoubledConjunction from 'textlint-rule-no-doubled-conjunction';
import textlintRuleNoConjunctiveParticleGa from 'textlint-rule-no-doubled-conjunctive-particle-ga';
import textlintRuleNoDoubledJoshi from 'textlint-rule-no-doubled-joshi';
import textlintRuleNoDroppingTheRa from 'textlint-rule-no-dropping-the-ra';
import textlintRuleNoHankakuKana from 'textlint-rule-no-hankaku-kana';
import textlintRuleNoKinshiYogo from 'textlint-rule-no-hoso-kinshi-yogo';
import textlintRulePreferTariTari from 'textlint-rule-prefer-tari-tari';
import textlintRuleSentenceLength from 'textlint-rule-sentence-length';

import { AsyncLinter, Annotation } from 'codemirror/addon/lint/lint';
import loggerFactory from '../../../utils/logger';

type RulesConfigObj = {
  name: string,
  options?: unknown,
}

type RuleExtension = {
  ext: string
}

const ruleModulesList = {
  'common-misspellings': textlintRuleCommonMisspellings,
  'ja-hiragana-fukushi': textlintRuleJaHiraganaFukushi,
  'ja-hiragana-hojodoushi': textlintRuleJaHiraganaHojodoushi,
  'ja-hiragana-keishikimeishi': textlintRuleJaHiraganaKeishikimeishi,
  'ja-no-abusage': textlintRuleJaNoAbusage,
  'ja-no-inappropriate-words': textlintRuleJaNoInappropriateWords,
  'ja-no-mixed-period': textlintRuleJaNoMixedPeriod,
  'ja-no-redundant-expression': textlintRuleJaNoRedundantExpression,
  'max-comma': textlintRuleMaxComma,
  'max-kanji-continuous-len': textlintRuleMaxKanjiContinuousLen,
  'max-ten': textlintRuleMaxTen,
  'no-double-negative-ja': textlintRuleNoDoubleNegativeJa,
  'no-doubled-conjunction': textlintRuleNoDoubledConjunction,
  'no-doubled-conjunctive-particle-ga': textlintRuleNoConjunctiveParticleGa,
  'no-doubled-joshi': textlintRuleNoDoubledJoshi,
  'no-dropping-the-ra': textlintRuleNoDroppingTheRa,
  'no-hankaku-kana': textlintRuleNoHankakuKana,
  'no-hoso-kinshi-yogo': textlintRuleNoKinshiYogo,
  'prefer-tari-tari': textlintRulePreferTariTari,
  'sentence-length': textlintRuleSentenceLength,
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
