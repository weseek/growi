import { TextlintKernel } from '@textlint/kernel';
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
          rule: require('textlint-rule-no-mix-dearu-desumasu'),
        },
      ],
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
      })
      .catch((error) => {
        console.error(error);
      });
  };
}
