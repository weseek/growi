/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
import { reshapeContentsBody } from './reshape-contents-body';

describe('reshapeContentsBody', () => {

  describe('Markdown only', () => {
    test('Return the same input', () => {
      // const input = '# Title  \n## Section  \nI tested this code at 12:00 AM.  \n**bold** text\nsome texts';
      const input = `
      # Title\s\s
      ## Section\s\s
      I tested this code at 12:00 AM.\s\s
      **bold** text
      some texts`;

      expect(reshapeContentsBody(input)).toBe(input);
    });
  });

  describe('Contains time but no headers', () => {
    test('Return the same input', () => {
      // const input = '12:23\nsome messages...\n12:23\nsome messages...\n12:23';
      const input = `
12:23
some messages...
12:23
some messages...
12:23`;

      expect(reshapeContentsBody(input)).toBe(input);
    });
  });

  describe('Copied from Slack only', () => {
    test('Reshape', () => {
      // const input = 'taichi-m  12:23 PM\nsome messages...\nsome messages...\nsome messages...\n12:23\nsome messages...\n12:23\nsome messages...';
      // const output = '\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>\n  \nsome messages...  \nsome messages...  \nsome messages...  \n--12:23--  \nsome messages...  \n--12:23--  \nsome messages...  \n</div>  \n';
      const input = `
taichi-m  12:23 PM
some messages...
some messages...
some messages...
12:23
some messages...
12:23
some messages...`;

      const output = `

<div class="grw-togetter">

## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>
\s\s
some messages...\s\s
some messages...\s\s
some messages...\s\s
--12:23--\s\s
some messages...\s\s
--12:23--\s\s
some messages...\s\s
</div>\s\s
`;

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Copied from Slack only (24 hours format)', () => {
    test('Reshape', () => {
      // const input = 'taichi-m  12:23\nsome messages...\nsome messages...\nsome messages...\n12:23\nsome messages...\n12:23\nsome messages...';
      // const output = '\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23</span>\n  \nsome messages...  \nsome messages...  \nsome messages...  \n--12:23--  \nsome messages...  \n--12:23--  \nsome messages...  \n</div>  \n';
      const input = `
taichi-m  12:23
some messages...
some messages...
some messages...
12:23
some messages...
12:23
some messages...`;

      const output = `

<div class="grw-togetter">

## **taichi-m**<span class="grw-togetter-time">  12:23</span>
\s\s
some messages...\s\s
some messages...\s\s
some messages...\s\s
--12:23--\s\s
some messages...\s\s
--12:23--\s\s
some messages...\s\s
</div>\s\s
`;

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Markdown and copied from Slack', () => {
    test('Reshape only after the first header', () => {
      // const input = 'some messages...\n\ntaichi-m  12:23 PM\nsome messages...';
      // const output = 'some messages...\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>\n  \nsome messages...  \n</div>  \n';
      const input = `
some messages...

taichi-m  12:23 PM
some messages...`;

      const output = `
some messages...
<div class="grw-togetter">

## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>
\s\s
some messages...\s\s
</div>\s\s
`;

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

});
