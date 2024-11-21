import { faker } from '@faker-js/faker';

import { _consumePoints } from './factory';

// Issue: https://github.com/animir/node-rate-limiter-flexible/issues/216
const assertInitialConsumeFails = async(method: string, key: string, maxRequests: number): Promise<void> => {
  try {
    await _consumePoints(method, key, { method, maxRequests });
    throw new Error('Exception occurred');
  }
  catch (err) {
    expect(err.message).not.toBe('Exception occurred');
    expect(err).toBeInstanceOf(TypeError);
    expect(err.message).toBe("Cannot read properties of null (reading 'points')");
  }
};

const testRateLimitErrorWhenExceedingMaxRequests = async(method: string, key: string, maxRequests: number): Promise<void> => {
  let count = 0;
  try {
    for (let i = 1; i <= maxRequests + 1; i++) {
      count += 1;
      // eslint-disable-next-line no-await-in-loop
      const res = await _consumePoints(method, key, { method, maxRequests });
      if (count === maxRequests) {
        // Expect consumedPoints to be equal to maxRequest when maxRequest is reached
        expect(res?.consumedPoints).toBe(maxRequests);
        // Expect remainingPoints to be 0 when maxRequest is reached
        expect(res?.remainingPoints).toBe(0);
      }
      if (count > maxRequests) {
        throw new Error('Exception occurred');
      }
    }
  }
  catch (err) {
    // Expect not to exceed maxRequest
    expect(err.message).not.toBe('Exception occurred');

    // Expect rate limit error at maxRequest + 1
    expect(count).toBe(maxRequests + 1);
  }
};

describe('factory.ts', async() => {
  describe('_consumePoints()', async() => {
    it('Should trigger a rate limit error when maxRequest is exceeded (maxRequest: 1)', async() => {
      // setup
      const method = 'GET';
      const key = 'test-key-1';
      const maxRequests = 1;

      await assertInitialConsumeFails(method, key, maxRequests);
      await testRateLimitErrorWhenExceedingMaxRequests(method, key, maxRequests);
    });

    it('Should trigger a rate limit error when maxRequest is exceeded (maxRequest: 1)', async() => {
      // setup
      const method = 'GET';
      const key = 'test-key-2';
      const maxRequests = 500;

      await assertInitialConsumeFails(method, key, maxRequests);
      await testRateLimitErrorWhenExceedingMaxRequests(method, key, maxRequests);
    });

    it('Should trigger a rate limit error when maxRequest is exceeded (maxRequest: {random integer between 1 and 1000})', async() => {
      // setup
      const method = 'GET';
      const key = 'test-key-3';
      const maxRequests = faker.number.int({ min: 1, max: 1000 });

      await assertInitialConsumeFails(method, key, maxRequests);
      await testRateLimitErrorWhenExceedingMaxRequests(method, key, maxRequests);
    });
  });

});
