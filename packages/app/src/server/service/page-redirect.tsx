import { pagePathUtils, pageUtils } from '@growi/core';
import mongoose from 'mongoose';

import { PageModel } from '../models/page';
import { PageRedirectModel, PageRedirectDocument } from '../models/page-redirect';

const { isPermalink: _isPermalink } = pagePathUtils;
const { getPageIdFromPathname } = pageUtils;

class PageRedirectService {

  crowi: any;

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * find PageRedirect Model document depends on currentPathname and withRedirect option
   * withRedirect options is a query string set by user renaming a page with redirect option
   */
  async getPageRedirectByCurrentPathnameAndWithRedirect(currentPathname: string, _withRedirect?: string):Promise<PageRedirectDocument | null | undefined> {
    const isPermalink = _isPermalink(currentPathname);
    const withRedirect = _withRedirect === 'true';

    if (!isPermalink) {
      return this.getPageRedirectOnAccessedWithPath(currentPathname);
    }
    if (isPermalink && withRedirect) {
      const pageId = getPageIdFromPathname(currentPathname);
      if (pageId != null) {
        return this.getPageRedirectOnAccessedByWithRedirectOptiton(pageId);
      }
    }
  }

  /**
   * When accessed with URL such as '/path_ABC'
   * This case, it's mandatory to get PageModel doc to find PageRedirectModel doc
   */
  private async getPageRedirectOnAccessedWithPath(path: string): Promise<PageRedirectDocument | null> {
    return this.getPageRedirectByFromPath(path);
  }

  /**
   * When accessed with URL such as '/1a2b3c4e5f6g7h?withRedirect=true'
   * This case, it's mandatory to get PageModel doc to find PageRedirectModel doc
   */
  private async getPageRedirectOnAccessedByWithRedirectOptiton(pageId: string): Promise<PageRedirectDocument | null | undefined> {
    const Page = this.crowi.model('Page') as PageModel;

    const page = await Page.findById(pageId);
    if (page != null) {
      return this.getPageRedirectByToPath(page.path);
    }
  }

  /**
   * find PageRedirect doc by fromPath
   */
  async getPageRedirectByFromPath(path: string):Promise<PageRedirectDocument | null> {
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    return PageRedirect.findOne({ fromPath: path });
  }

  /**
   * find PageRedirect doc by toPath
   */
  async getPageRedirectByToPath(path: string):Promise<PageRedirectDocument | null> {
    const PageRedirect = mongoose.model('PageRedirect') as unknown as PageRedirectModel;
    return PageRedirect.findOne({ toPath: path });
  }

}

export default PageRedirectService;
