import { TextlintKernel, TextlintKernelRule, TextlintRuleOptions } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';
import textlintRuleMaxComma from 'textlint-rule-max-comma';
import textlintRuleCommonMisspellings from 'textlint-rule-common-misspellings';
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
  'max-comma': textlintRuleMaxComma,
  'common-misspellings': textlintRuleCommonMisspellings,
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
