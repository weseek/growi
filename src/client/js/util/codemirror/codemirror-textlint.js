import { TextLintCore } from 'textlint';

export default function createValidator(options = {}) {
  const textlint = new TextLintCore();
  const rules = options.rules || {};
  const rulesConfig = options.rulesConfig || {};
  const Processors = options.Processors || [];
  textlint.setupRules(rules, rulesConfig);
  Processors.forEach((Processor) => {
    textlint.setupPlugins({
      yourPluginName: Processor,
    });
  });
  function convertSeverity(severity) {
    switch (severity) {
      case 1:
        return 'warning';
      case 2:
        return 'error';
      default:
        return 'error';
    }
  }

  return function textlintValidator(text, updateLinting) {
    textlint.lintMarkdown(text).then((result) => {
      const results = [];
      result.messages.forEach((message) => {
        // https://codemirror.net/doc/manual.html
        // the API uses objects with line and ch properties. Both are zero-based.
        const posFrom = { line: message.line - 1, ch: message.column - 1 };
        const posTo = { line: message.line - 1, ch: message.column };
        results.push({
          from: posFrom,
          to: posTo,
          message: message.message,
          severity: convertSeverity(message.severity),
        });
      });
      updateLinting(results);
    });
  };
}
