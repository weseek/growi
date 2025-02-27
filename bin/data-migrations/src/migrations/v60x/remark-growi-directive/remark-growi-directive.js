/**
 * @typedef {import('../../../types').MigrationModule} MigrationModule
 */

module.exports = [
  /**
   * Adjust line breaks and indentation for any directives within HTML tags
   * @type {MigrationModule}
   */
  (body) => {
    const lines = body.split('\n');
    const directivePattern = /\$[\w-]+\([^)]*\)/;

    for (let i = 0; i < lines.length; i++) {
      if (directivePattern.test(lines[i])) {
        const currentLine = lines[i];
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

        lines[i] = currentLine.trimStart();

        if (prevLine.includes('>') && prevLine.trim() !== '') {
          lines.splice(i, 0, '');
          i++;
        }

        if (nextLine.includes('</')) {
          lines[i + 1] = nextLine.trimStart();
        }
      }
    }

    return lines.join('\n');
  },

  /**
   * Remove unnecessary parentheses in directive arguments
   * @type {MigrationModule}
   */
  (body) => {
    return body.replace(/\$[\w-]+\([^)]*\)/g, (match) => {
      return match
        .replace(/filter=\(([^)]+)\)/g, 'filter=$1')
        .replace(/except=\(([^)]+)\)/g, 'except=$1');
    });
  },
];
