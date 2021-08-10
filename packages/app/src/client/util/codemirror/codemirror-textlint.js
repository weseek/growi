import { TextlintKernel } from '@textlint/kernel';
import { moduleInterop } from '@textlint/module-interop';
import textlintToCodeMirror from 'textlint-message-to-codemirror';

const kernel = new TextlintKernel();

let textlintOption = {};

const createSetupRules = (rules, ruleOptions) => {
  return Object.keys(rules).map((ruleName) => {
    console.log(ruleName);
    return {
      ruleId: ruleName,
      rule: rules[ruleName],
      options: ruleOptions[ruleName],
    };
  });
};


export default function createValidator() {
  const enabledRules = [
    {
      name: 'max-comma',
      rule: moduleInterop(require('textlint-rule-max-comma')),
      options: {
        max: 2,
      },
    },
    {
      name: 'common-misspellings',
      rule: moduleInterop(require('textlint-rule-common-misspellings')),
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
