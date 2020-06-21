const { getInstance } = require('../setup-crowi');

describe('ShareLink', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let ShareLink;
  let Page;
  let relatedPage = {};

  beforeAll(async(done) => {
    crowi = await getInstance();
    ShareLink = crowi.model('ShareLink');
    Page = require('@server/routes/page')(crowi);

    relatedPage = {
      path: '/somePath',
      grant: Page.GRANT_PUBLIC,
      populateDataToShowRevision: () => {
        return {
          revision: {},
          creator: {},
        };
      },
    };

    done();
  });

  describe('accessShareLink', () => {
    const req = {
      path: '/share/:id',
      params: {
        linkId: 'someLinkId',
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
        return { populate: () => { return { _id: 'somePageId' } } };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/not_found_shared_page');
    });


    test('share link is found, but it is expired', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return {
          populate: () => {
            return {
              _id: 'somePageId', relatedPage, isExpired: () => { return true },
            };
          },
        };
      });

      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/expired_shared_page');
    });

    test('share link is found, and it has the page you can see', async() => {

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return {
          populate: () => {
            return {
              _id: 'somePageId', relatedPage, isExpired: () => { return false },
            };
          },
        };
      });
      const response = await Page.showSharedPage(req, res);

      expect(response).toEqual('layout-growi/shared_page');
    });
  });

});
