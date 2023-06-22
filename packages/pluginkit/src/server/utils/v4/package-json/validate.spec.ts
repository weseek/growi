import path from 'path';

import { validatePackageJson } from './validate';

describe('validatePackageJson()', () => {

  it('returns a data object', async() => {
    // when
    const data = await validatePackageJson(path.resolve(__dirname, '../../../../../test/fixtures/example-package/template1'));

    // then
    expect(data).not.toBeNull();
  });

});
