import { mock } from 'vitest-mock-extended';

import { addDepthCondition } from './add-depth-condition';
import type { PageQuery } from './generate-base-query';

describe('addDepthCondition()', () => {

  it('returns query as-is', () => {
    // setup
    const query = mock<PageQuery>();

    // when
    const result = addDepthCondition(query, '/', null);

    // then
    expect(result).toEqual(query);
  });

});
