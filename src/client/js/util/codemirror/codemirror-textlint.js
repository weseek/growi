import { TextlintKernel } from '@textlint/kernel';
import textlintToCodeMirror from 'textlint-message-to-codemirror';

// const textlintKernel = new TextlintKernel();

//     textlintKernel
//       .lintText(text, textlintOption)
//       .then((result) => {
//         const lintMessages = result.messages;
//         const lintErrors = lintMessages.map(textlintToCodeMirror);
//         callback(lintErrors);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   };
// }


const kernel = new TextlintKernel();

const textlintOptions = {
  plugins: [
    {
      pluginId: 'markdown',
      plugin: require('@textlint/textlint-plugin-markdown'),
    },
  ],
  rules: [
    {
      ruleId: 'no-todo',
      rule: require('textlint-rule-no-todo').default,
    },
  ],
};

kernel.lintText('TODO: text', textlintOptions)
  .then((result) => {
    assert.ok(typeof result.filePath === 'string');
    assert.ok(result.messages.length === 1);
  });
