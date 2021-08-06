import { TextlintKernel } from '@textlint/kernel';
import { moduleInterop } from '@textlint/module-interop';
import textlintToCodeMirror from 'textlint-message-to-codemirror';

const kernel = new TextlintKernel();

let textlintOption = {};

export default function createValidator() {
  textlintOption = Object.assign(
    {},
    {
      rules: [
        {
          ruleId: 'no-mix-dearu-desumasu',
          rule: moduleInterop(require('textlint-rule-no-mix-dearu-desumasu')),
        },
        {
          ruleId: 'common-misspellings',
          rule: moduleInterop(require('textlint-rule-common-misspellings')),
        },
        {
          ruleId: 'no-todo',
          rule: moduleInterop(require('textlint-rule-no-todo')),
        },
      ],
      plugins: [
        {
          pluginId: 'markdown',
          plugin: moduleInterop(require('textlint-plugin-markdown')),
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
      })
      .catch((error) => {
        console.error(error);
      });
  };
}
