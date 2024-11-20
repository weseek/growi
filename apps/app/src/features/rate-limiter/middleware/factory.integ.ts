import { _consumePoints } from './factory';

describe('factory.ts', async() => {
  describe('_consumePoints()', async() => {
    it('test1', async() => {
      // setup
      const method = 'GET';
      const key = 'test-key-1';
      const maxRequests = 1;

      // Issue: https://github.com/animir/node-rate-limiter-flexible/issues/216
      try {
        await _consumePoints(method, key, { method, maxRequests });
        throw new Error('Exception occurred');
      }
      catch (err) {
        expect(err.message).not.toBe('Exception occurred');
        expect(err).toBeInstanceOf(TypeError);
        expect(err.message).toBe("Cannot read properties of null (reading 'points')");
      }

      // when
      const res = await _consumePoints(method, key, { method, maxRequests });

      // then
      expect(res?.remainingPoints).toBe(0);
      expect(res?.consumedPoints).toBe(100);
    });
  });

});
