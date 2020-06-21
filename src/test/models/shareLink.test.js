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
        linkId: 'someLinkId',
      },
    };

    const res = {
      render: (page) => { return page },
    };

    const shareLink = {
      populate: null,
    };

    const relatedPage = {
      path: '/somePath',
      populateDataToShowRevision: () => {
        return {
          revision: {},
          creator: {},
        };
      },
    };

    test('share link is not found', async() => {

      shareLink.populate = jest.fn(() => { return null });

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return shareLink;
      });

      const response = await Page.showSharedPage(req, res);

      expect(shareLink.populate).toHaveBeenCalled();
      expect(response).toEqual('layout-growi/not_found_shared_page');
    });

    test('share link is found, but it does not have Page', async() => {

      shareLink.populate = jest.fn(() => { return { _id: 'somePageId' } });

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return shareLink;
      });
      const response = await Page.showSharedPage(req, res);

      expect(shareLink.populate).toHaveBeenCalled();
      expect(response).toEqual('layout-growi/not_found_shared_page');
    });


    test('share link is found, but it is expired', async() => {

      shareLink.populate = jest.fn(() => { return { _id: 'somePageId', relatedPage, isExpired: () => { return true } } });

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return shareLink;
      });

      const response = await Page.showSharedPage(req, res);

      expect(shareLink.populate).toHaveBeenCalled();
      expect(response).toEqual('layout-growi/expired_shared_page');
    });

    test('share link is found, and it has the page you can see', async() => {

      shareLink.populate = jest.fn(() => { return { _id: 'somePageId', relatedPage, isExpired: () => { return false } } });

      jest.spyOn(ShareLink, 'findOne').mockImplementation(() => {
        return shareLink;
      });
      const response = await Page.showSharedPage(req, res);

      expect(shareLink.populate).toHaveBeenCalled();
      expect(response).toEqual('layout-growi/shared_page');
    });
  });

});
