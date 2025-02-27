/**
 * @typedef {import('../../../types').MigrationModule} MigrationModule
 */

module.exports = [
  /**
   * Adjust line breaks and indentation for $lsx() within HTML tags
   * @type {MigrationModule}
   */
  (body) => {
    // Split into lines for better processing
    const lines = body.split('\n');

    for (let i = 0; i < lines.length; i++) {
      // Find lines containing $lsx()
      if (lines[i].includes('$lsx(')) {
        const currentLine = lines[i];
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

        // Remove indentation from current line
        lines[i] = currentLine.trimStart();

        // If previous line contains an HTML tag and is not an empty line
        if (prevLine.includes('>') && prevLine.trim() !== '') {
          // Insert empty line
          lines.splice(i, 0, '');
          i++; // Adjust index after insertion
        }

        // If next line contains an HTML tag
        if (nextLine.includes('</')) {
          // Handle next line (remove indentation)
          lines[i + 1] = nextLine.trimStart();
        }
      }
    }

    return lines.join('\n');
  },

  /**
   * Remove unnecessary parentheses in $lsx() filter arguments
   * @type {MigrationModule}
   */
  (body) => {
    return body.replace(/\$lsx\([^)]*\)/g, (match) => {
      // Find and remove parentheses in filter=(...) pattern
      return match.replace(/filter=\(([^)]+)\)/g, 'filter=$1');
    });
  },
];
