import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { generateCmsRenderingOptions } from '~/services/renderer/cms_renderer';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:cms:pages');

module.exports = function(crowi) {
  const Page = crowi.model('Page');

  const actions: any = {};
  const api: any = {};

  actions.api = api;

  const { configManager } = crowi;

  const rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    isEnabledMarp: configManager.getConfig('crowi', 'customize:isEnabledMarp'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: configManager.getConfig('crowi', 'app:plantumlUri'),

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhitelist: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhitelist: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };

  /**
   * @api {get} /pages.get get pages
   * @apiName get
   * @apiGroup Page
   *
   * @apiParam {String} id
   */
  api.get = async function(req, res) {
    const pageId = req.params.pageId;

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId);
    }
    catch (err) {
      logger.error('get-page-failed', err);
      return res.apiv3Err(err, 500);
    }

    if (page == null) {
      return res.apiv3Err('Page is not found', 404);
    }

    if (page != null) {
      try {
        page.initLatestRevisionField(undefined);

        // populate
        page = await page.populateDataToShowRevision();
      }
      catch (err) {
        logger.error('populate-page-failed', err);
        return res.apiv3Err(err, 500);
      }
    }

    // generateCmsRenderingOptions;

    const htmlString = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(remarkStringify)
      .process(page.revision.body);

    return res.apiv3({ ...page, htlm: htmlString });
  };

  return actions;
};
