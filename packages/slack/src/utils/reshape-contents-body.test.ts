import { reshapeContentsBody } from './reshape-contents-body';

describe('reshapeContentsBody', () => {

  test('Create formatted text for GROWI', () => {
    const text = 'Random text';
    expect(() => {
      reshapeContentsBody(text);
    }).to;
  });

});
