const { getInstance } = require('../setup-crowi');

describe('ShareLink', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;
  let ShareLink;
  let Page;

  beforeAll(async() => {
    crowi = await getInstance();
    ShareLink = crowi.model('ShareLink');
    Page = require('~/server/routes/page')(crowi);
  });

  describe('accessShareLink', () => {
    const req = {
      path: '/share/:id',
      params: {
        linkId: 'someLinkId',
      },
      query: {
        revision: 'someRevision',
      },
    };

    const res = {
      render: jest.fn((page, renderVars = null) => { return { page, renderVars } }),
    };

    const findOneResult = {
      populate: null,
    };

    const relatedPage = {
      path: '/somePath',
      populateDataToShowRevision: () => {
        return {
          revision: {
            author: {
              toObject: jest.fn(() => { return {} }),
            },
          },
          creator: {
            toObject: jest.fn(() => { return {} }),
          },
        };
      },
      initLatestRevisionField: (revisionId) => {
        return revisionId;
      },
    };

  });

});
