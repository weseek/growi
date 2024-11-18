import { connection } from 'mongoose';
import { type IRateLimiterMongoOptions, type RateLimiterRes, RateLimiterMongo } from 'rate-limiter-flexible';

import { _consumePoints, POINTS_THRESHOLD } from './factory';


// const mocks = vi.hoisted(() => {
//   return {
//     comsumeMock: vi.fn(),
//   };
// });

// vi.mock('rate-limiter-flexible', () => ({
//   RateLimiterMongo: vi.fn().mockImplementation(() => {
//     return {
//       consume: mocks.comsumeMock,
//     };
//   }),
// }));

describe('factory.ts', () => {

  const opts = {
    storeClient: connection,
    points: 100,
    duration: 60,
  };

  const rateLimiter = new RateLimiterMongo(opts);


  it('test', async() => {
    // setup
    // const method = 'GET';
    // const key = 'test-key';
    // const maxRequests = 1;

    // const res = await _consumePoints('GET', key, { method, maxRequests });

    console.log('rateLimiter', rateLimiter);

    const res = await rateLimiter.consume('test-key', 10);
    console.log('res', res);
  });


  // describe('_consumePoints()', () => {
  //   it('Should consume points as 1 * THRESHOLD if maxRequest: 1 is specified', async() => {
  //     // setup
  //     const method = 'GET';
  //     const key = 'test-key';
  //     const maxRequests = 1;

  //     // when
  //     const pointsToConsume = POINTS_THRESHOLD / maxRequests;
  //     await _consumePoints(method, key, { method, maxRequests });

  //     // then
  //     expect(mocks.comsumeMock).toHaveBeenCalledWith(key, pointsToConsume);
  //     expect(maxRequests * pointsToConsume).toBe(POINTS_THRESHOLD);
  //   });

  //   it('Should consume points as 2 * THRESHOLD if maxRequest: 2 is specified', async() => {
  //     // setup
  //     const method = 'GET';
  //     const key = 'test-key';
  //     const maxRequests = 2;

  //     // when
  //     const pointsToConsume = POINTS_THRESHOLD / maxRequests;
  //     await _consumePoints(method, key, { method, maxRequests });

  //     // then
  //     expect(mocks.comsumeMock).toHaveBeenCalledWith(key, pointsToConsume);
  //     expect(maxRequests * pointsToConsume).toBe(POINTS_THRESHOLD);
  //   });

  //   it('Should consume points as 3 * THRESHOLD if maxRequest: 3 is specified', async() => {
  //     // setup
  //     const method = 'GET';
  //     const key = 'test-key';
  //     const maxRequests = 3;

  //     // when
  //     const pointsToConsume = POINTS_THRESHOLD / maxRequests;
  //     await _consumePoints(method, key, { method, maxRequests });

  //     // then
  //     expect(mocks.comsumeMock).toHaveBeenCalledWith(key, pointsToConsume);
  //     expect(maxRequests * pointsToConsume).toBe(POINTS_THRESHOLD);
  //   });

  //   it('Should consume points as 500 * THRESHOLD if maxRequest: 500 is specified', async() => {
  //     // setup
  //     const method = 'GET';
  //     const key = 'test-key';
  //     const maxRequests = 500;

  //     // when
  //     const pointsToConsume = POINTS_THRESHOLD / maxRequests;
  //     await _consumePoints(method, key, { method, maxRequests });

  //     // then
  //     expect(mocks.comsumeMock).toHaveBeenCalledWith(key, pointsToConsume);
  //     expect(maxRequests * pointsToConsume).toBe(POINTS_THRESHOLD);
  //   });

  // });
});
