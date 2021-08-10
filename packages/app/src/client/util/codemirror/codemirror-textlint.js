import { TextlintKernel } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';

const ruleModulesList = {
  'max-comma': require('textlint-rule-max-comma').default,
  'common-misspellings': require('textlint-rule-common-misspellings').default,
};

const kernel = new TextlintKernel();

let textlintOption = {};

const createSetupRules = (rules, ruleOptions) => (
  Object.keys(rules).map(ruleName => (
    {
      ruleId: ruleName,
      rule: rules[ruleName],
      options: ruleOptions[ruleName],
    }
  ))
);


export default function createValidator(rulesConfigArray) {
  const rules = rulesConfigArray.reduce((rules, rule) => {
    rules[rule.name] = ruleModulesList[rule.name];
    return rules;
  }, {});

  const rulesOption = rulesConfigArray.reduce((rules, rule) => {
    rules[rule.name] = rule.options || {};
    return rules;
  }, {});


  textlintOption = Object.assign(
    {},
    {
      rules: createSetupRules(rules, rulesOption),
      plugins: [
        {
          pluginId: 'markdown',
          plugin: require('textlint-plugin-markdown'),
        },
      ],
      ext: '.md',
    },
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
        const lintErrors = lintMessages.map(textlintToCodeMirror);
        callback(lintErrors);
      });
  };
}
