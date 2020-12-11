const { getInstance } = require('../setup-crowi');
import { getServerSideCommonProps, useCustomTitle, useCustomTitleForPage } from '~/utils/nextjs-page-utils';
import DevidedPagePath from '~/models/devided-page-path';

jest.mock('~/models/devided-page-path');

describe('.getServerSideCommonProps', () => {
  let crowi
  beforeEach(async() => {
    crowi = await getInstance()
    crowi.customizeService = { customTitleTemplate: 'customTitleTemplate' }
  })
  test('should be return replaced text', async() => {
    const result = await getServerSideCommonProps(
      {
        req: { crowi },
        resolvedUrl: 'resolvedUrl',
      },
    );
    expect(result).toMatchObject(
      {
        props: {
          namespacesRequired: ['translation'],
          currentPagePath: '/resolvedUrl',
          appTitle: 'GROWI',
          customTitleTemplate: 'customTitleTemplate',
        },
      },
    );
  });
  test('should be return currentPagePath', async() => {
    const result = await getServerSideCommonProps(
      {
        req: { crowi },
        resolvedUrl: 'resolvedUrl',
      },
    );
    expect(result.props.currentPagePath).toBe('/resolvedUrl');
  });

  /* eslint-disable indent */
  test.each`
    resolvedUrl                      | currentPagePath
    ${'resolvedUrl'}                 | ${'/resolvedUrl'}
    ${'resolvedUrl?key=value'}       | ${'/resolvedUrl'}
    ${'resolved/%E3%83%91%E3%82%B9'} | ${'/resolved/パス'}
  `(
    'should be return $currentPagePath when resolvedUrl is $resolvedUrl',
    async({
      resolvedUrl, currentPagePath,
    }) => {
      const result = await getServerSideCommonProps(
        {
          req: { crowi },
          resolvedUrl,
        },
      );
      expect(result.props.currentPagePath).toBe(currentPagePath);
    },
  );
  /* eslint-disable indent */
});

describe('.useCustomTitle', () => {
  test('should be return replaced text', () => {
    const result = useCustomTitle(
      { customTitleTemplate: 'sitename: {{sitename}}, pagepath: {{pagepath}}, page: {{page}}, pagename: {{pagename}}', appTitle: 'appTitle' },
      'replaceTitle',
    );
    expect(result).toBe('sitename: appTitle, pagepath: replaceTitle, page: replaceTitle, pagename: replaceTitle');
  });
});

describe('.useCustomTitleForPage', () => {
  beforeAll(() => {
    DevidedPagePath.mockImplementationOnce(() => {
      return {
        latter: 'replaceLatter',
      };
    });
  });
  test('should be return replaced text', () => {
    const result = useCustomTitleForPage(
      { customTitleTemplate: 'sitename: {{sitename}}, pagepath: {{pagepath}}, page: {{page}}, pagename: {{pagename}}', appTitle: 'appTitle' },
      'replacePagePath',
    );
    expect(result).toBe('sitename: appTitle, pagepath: replacePagePath, page: replaceLatter, pagename: replaceLatter');
  });
});
