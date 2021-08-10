import { TextlintKernel } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';

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


export default function createValidator() {
  const enabledRules = [
    {
      name: 'max-comma',
      rule: require('textlint-rule-max-comma').default,
    },
    {
      name: 'common-misspellings',
      rule: require('textlint-rule-common-misspellings').default,
      options: {
        ignore: [
          'isnt',
          'yuo',
          'carefull',
        ],
      },
    },

  ];


  const rules = enabledRules.reduce((rules, rule) => {
    rules[rule.name] = rule.rule;
    return rules;
  }, {});

  const rulesOption = enabledRules.reduce((rules, rule) => {
    rules[rule.name] = rule.options;
    return rules;
  }, {});

  textlintOption = Object.assign(
    {},
    {
      // rules: [
      //   {
      //     ruleId: 'common-misspellings',
      //     rule: require('textlint-rule-common-misspellings').default,
      //     enable: true,
      //   },
      // ],
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
