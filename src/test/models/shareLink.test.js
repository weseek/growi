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
      render: (page) => { return page },
    };

    test('share link is not found', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => { return { populate: () => { return { expiredAt: '2020-05-29T14:44:28.064Z' } } } });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/not_found_shared_page');
    });
  });

});
