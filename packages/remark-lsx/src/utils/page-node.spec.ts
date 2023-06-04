import { IPageHasId } from '@growi/core';
import { mock } from 'vitest-mock-extended';

import { PageNode } from '../interfaces/page-node';

import { generatePageNodeTree } from './page-node';


function omitPageData(pageNode: PageNode): Omit<PageNode, 'page'> {
  const obj = Object.assign({}, pageNode);
  delete obj.page;

  // omit data in children
  obj.children = obj.children.map(child => omitPageData(child));

  return obj;
}

describe('generatePageNodeTree()', () => {

  it('returns with non-empty pages', () => {
    // setup
    const pages: IPageHasId[] = [
      '/',
      '/Sandbox',
      '/Sandbox/child1',
      '/Sandbox/child2',
      '/Sandbox/child2/child2-1',
      '/Sandbox/child2/child2-2',
      '/Sandbox/child2/child2-3',
    ].map(path => mock<IPageHasId>({ path }));

    // when
    const result = generatePageNodeTree('/', pages);
    const resultWithoutPageData = result.map(pageNode => omitPageData(pageNode));

    // then
    expect(resultWithoutPageData).toStrictEqual([
      {
        pagePath: '/Sandbox',
        children: [
          {
            pagePath: '/Sandbox/child1',
            children: [],
          },
          {
            pagePath: '/Sandbox/child2',
            children: [
              {
                pagePath: '/Sandbox/child2/child2-1',
                children: [],
              },
              {
                pagePath: '/Sandbox/child2/child2-2',
                children: [],
              },
              {
                pagePath: '/Sandbox/child2/child2-3',
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('returns with empty pages', () => {
    // setup
    const pages: IPageHasId[] = [
      '/',
      '/user/foo',
      '/user/bar',
      '/user/bar/memo/2023/06/01',
      '/user/bar/memo/2023/06/02/memo-test',
    ].map(path => mock<IPageHasId>({ path }));

    // when
    const result = generatePageNodeTree('/', pages);
    const resultWithoutPageData = result.map(pageNode => omitPageData(pageNode));

    // then
    expect(resultWithoutPageData).toStrictEqual([

      {
        pagePath: '/user',
        children: [
          {
            pagePath: '/user/foo',
            children: [],
          },
          {
            pagePath: '/user/bar',
            children: [
              {
                pagePath: '/user/bar/memo',
                children: [
                  {
                    pagePath: '/user/bar/memo/2023',
                    children: [
                      {
                        pagePath: '/user/bar/memo/2023/06',
                        children: [
                          {
                            pagePath: '/user/bar/memo/2023/06/01',
                            children: [],
                          },
                          {
                            pagePath: '/user/bar/memo/2023/06/02',
                            children: [
                              {
                                pagePath: '/user/bar/memo/2023/06/02/memo-test',
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

});
