import { _consumePoints } from './factory';

describe('factory.ts', async() => {

  // Issue: https://github.com/animir/node-rate-limiter-flexible/issues/216
  try {
    await _consumePoints('GET', 'test-key', { method: 'GET', maxRequests: 1 });
  }
  catch {
    //
  }

  describe('_consumePoints()', () => {
    it('test', async() => {
      // setup
      const method = 'GET';
      const key = 'test-key';
      const maxRequests = 100;

      try {
        await _consumePoints('GET', key, { method, maxRequests });
      }
      catch (error) {
        //
      }

      try {
        const res = await _consumePoints('GET2', key, { method, maxRequests });
        console.log('res', res);
        const res2 = await _consumePoints('GET2', key, { method, maxRequests });
        console.log('res2', res2);
        const res3 = await _consumePoints('GET2', key, { method, maxRequests });
        console.log('res3', res3);
      }
      catch (error) {
        console.log('エラー', error);
      }
    });
  });

});
