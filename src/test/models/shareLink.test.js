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

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return { populate: () => { return null } };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/not_found_shared_page');
    });

    test('share link is found, but it does not have Page', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return { populate: () => { return { _id: '5ed11fcc60ec00c9072f7490' } } };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/not_found_shared_page');
    });


    test('share link is found, but it is expired', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return { populate: () => { return { _id: '5ed11fcc60ec00c9072f7490', relatedPage: {}, expiredAt: '2020-06-17T10:09:29.088Z' } } };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/expired_shared_page');
    });

    test('share link is found, and it has the page you can see', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return { populate: () => { return { _id: '5ed11fcc60ec00c9072f7490', relatedPage: {}, expiredAt: '2100-06-17T10:09:29.088Z' } } };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/shared_page');
    });
  });

});
