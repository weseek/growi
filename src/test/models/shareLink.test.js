const { getInstance } = require('../setup-crowi');

describe('ShareLink', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let ShareLink;
  let Page;

  beforeAll(async(done) => {
    crowi = await getInstance();
    ShareLink = crowi.model('ShareLink');
    Page = require('@server/routes/page')(crowi);

    await ShareLink.insertMany([
      { relatedPage: '5ed11fcc60ec00c9072f74a7', expiredAt: '2020-05-29T14:44:28.064Z' },
      { relatedPage: '5ed11fcc60ec00c9072f74a7', expiredAt: '2020-05-29T14:44:28.064Z' },
      { relatedPage: '5ed11fcc60ec00c9072f74a9', expiredAt: '2020-05-29T14:44:28.064Z' },
    ]);

    done();
  });

  describe('accessShareLink', () => {
    const req = {
      path: '/share/:id',
      params: {
        linkId: '5ed11fcc60ec00c9072f7410',
      },
    };

    const res = {
      found: jest.fn().mockReturnValue('layout-growi/shared_page'),
      expired: jest.fn().mockReturnValue('layout-growi/not_found_shared_page'),
      notFound: jest.fn().mockReturnValue('layout-growi/expired_shared_page'),
    };

    test('share link is not found', () => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => { return { populate: () => { return { expiredAt: '2020-05-29T14:44:28.064Z' } } } });

      Page.showSharedPage(req, res);

      expect(res.notFound).toHaveBeenCalledWith('/not_found_shared_page');
    });
  });

});
