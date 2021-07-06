/* eslint-disable max-len */
import { reshapeContentsBody } from './reshape-contents-body';

describe('reshapeContentsBody', () => {

  describe('Markdown only', () => {
    test('Strips out newline characters', () => {
      const input = '# Title  \n## Section  \nI tested this code at 12:00 AM.  \n**bold** text\nsome texts';
      const output = '# Title  ## Section  I tested this code at 12:00 AM.  **bold** textsome texts';

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Contains time but no headers', () => {
    test('Strips newline characters', () => {
      const input = '12:23\nsome messages...\n12:23\nsome messages...\n12:23';
      const output = '12:23some messages...12:23some messages...12:23';

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Copied from Slack only', () => {
    test('Reshape', () => {
      const input = 'taichi-m  12:23 PM\nsome messages...\nsome messages...\nsome messages...\n12:23\nsome messages...\n12:23\nsome messages...';
      const output = '\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>\n  \nsome messages...  \nsome messages...  \nsome messages...  \n--12:23--  \nsome messages...  \n--12:23--  \nsome messages...  \n</div>  \n';

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Copied from Slack only (24 hours format)', () => {
    test('Reshape', () => {
      const input = 'taichi-m  12:23\nsome messages...\nsome messages...\nsome messages...\n12:23\nsome messages...\n12:23\nsome messages...';
      const output = '\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23</span>\n  \nsome messages...  \nsome messages...  \nsome messages...  \n--12:23--  \nsome messages...  \n--12:23--  \nsome messages...  \n</div>  \n';

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

  describe('Markdown and copied from Slack', () => {
    test('Reshape only after the first header', () => {
      const input = 'some messages...\n\ntaichi-m  12:23 PM\nsome messages...';
      const output = 'some messages...\n<div class="grw-togetter">\n\n## **taichi-m**<span class="grw-togetter-time">  12:23 PM</span>\n  \nsome messages...  \n</div>  \n';

      expect(reshapeContentsBody(input)).toBe(output);
    });
  });

});
