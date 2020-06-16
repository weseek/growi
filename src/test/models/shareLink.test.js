const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('ShareLink', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let ShareLink;

  beforeAll(async(done) => {
    crowi = await getInstance();
    ShareLink = mongoose.model('ShareLink');

    await ShareLink.insertMany([
      { relatedPage: '5ed11fcc60ec00c9072f74a7', expiredAt: '2020-05-29T14:44:28.064Z' },
      { relatedPage: '5ed11fcc60ec00c9072f74a7', expiredAt: '2020-05-29T14:44:28.064Z' },
      { relatedPage: '5ed11fcc60ec00c9072f74a9', expiredAt: '2020-05-29T14:44:28.064Z' },
    ]);

    done();
  });

  describe('accessShareLink', () => {
    const res = {
      found: jest.fn().mockReturnValue('layout-growi/shared_page'),
      expired: jest.fn().mockReturnValue('layout-growi/not_found_shared_page'),
      notfound: jest.fn().mockReturnValue('layout-growi/expired_shared_page'),
    };

    test('share link is not found', () => {
      expect(res.notfound).toHaveBeenCalledWith('/login');
    });
  });

});
