import { getServerSideCommonProps, useCustomTitle, useCustomTitleForPage } from '~/utils/nextjs-page-utils';
import DevidedPagePath from '~/models/devided-page-path';
jest.mock('~/models/devided-page-path');

describe('.getServerSideCommonProps', () => {
  test('should be return replaced text', async() => {
    const result = await getServerSideCommonProps(
      {
        req: {
          crowi: {
            appService: { getAppTitle: jest.fn().mockImplementation(() => { return 'appTitle' }) },
            customizeService: { customTitleTemplate: 'customTitleTemplate' }
          }
        },
        resolvedUrl: 'resolvedUrl',
      }
    )
    expect(result).toMatchObject(
      {
        props: {
          namespacesRequired: [ 'translation' ],
          currentPagePath: '/resolvedUrl',
          appTitle: 'appTitle',
          customTitleTemplate: 'customTitleTemplate'
        }
      }
    )
  });
});

describe('.useCustomTitle', () => {
  test('should be return replaced text', () => {
    const result = useCustomTitle(
      { customTitleTemplate: 'sitename: {{sitename}}, pagepath: {{pagepath}}, page: {{page}}, pagename: {{pagename}}', appTitle: 'appTitle' },
      'replaceTitle'
    )
    expect(result).toBe('sitename: appTitle, pagepath: replaceTitle, page: replaceTitle, pagename: replaceTitle')
  });
});

describe('.useCustomTitleForPage', () => {
  beforeAll(() => {
    DevidedPagePath.mockImplementationOnce(() => {
      return {
        latter: 'replaceLatter'
      }
    })
  })
  test('should be return replaced text', () => {
    const result = useCustomTitleForPage(
      { customTitleTemplate: 'sitename: {{sitename}}, pagepath: {{pagepath}}, page: {{page}}, pagename: {{pagename}}', appTitle: 'appTitle' },
      'replacePagePath'
    )
    expect(result).toBe('sitename: appTitle, pagepath: replacePagePath, page: replaceLatter, pagename: replaceLatter')
  });
});
