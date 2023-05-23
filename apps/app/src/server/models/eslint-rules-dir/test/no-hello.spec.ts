import { RuleTester } from 'eslint';
import { test } from 'vitest';

import noHello from '../no-hello';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

test('test no-hello', () => {
  ruleTester.run('no-hello', noHello, {
    valid: [
      { code: 'const x = "goodbye"' },
      { code: 'const x = `goodbye`' },
    ],
    invalid: [
      { code: 'const x = "hello"', errors: [{ message: '"hello" is not allowed' }] },
      // eslint-disable-next-line no-template-curly-in-string
      { code: 'const x = `hello${process.env.MESSAGE}`', errors: [{ message: '"hello" is not allowed' }] },
    ],
  });
});
