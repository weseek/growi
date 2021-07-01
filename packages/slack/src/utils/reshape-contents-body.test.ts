import { reshapeContentsBody } from './reshape-contents-body';

describe('reshapeContentsBody', () => {

  describe('Create formatted text for GROWI', () => {

    test('1. Input does not contain name of the sender', () => {
      const input = '# Title  \n## Section  \nI tested this code at 12:00 AM  **bold** text';
      const output = '# Title  ## Section  I tested this code at 12:00 AM  **bold** text';

      expect(reshapeContentsBody(input)).toBe(output);
    });

    // test('2. Input does not contain name of the sender', () => {
    //   const input = '';
    //   const output = input;

    //   expect(reshapeContentsBody(input)).toBe(output);
    // });

    // test('3. Input does not contain name of the sender', () => {
    //   const input = '';
    //   const output = input;

    //   expect(reshapeContentsBody(input)).toBe(output);
    // });

    // test('4. Input does not contain name of the sender', () => {
    //   const input = '';
    //   const output = input;

    //   expect(reshapeContentsBody(input)).toBe(output);
    // });

  });

});
