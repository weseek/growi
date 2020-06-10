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

  describe('.shareLinkCount', () => {
    describe('has two links', () => {
      test('not found', async() => {
        let shareLink = null;
        shareLink = await ShareLink.countDocuments({ _id: '5ed11fcc60ec00c9072f74a6' });
        expect(shareLink).toEqual(0);
      });
    });
  });

});
