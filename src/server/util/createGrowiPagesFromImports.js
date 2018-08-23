module.exports = crowi => {
  'use strict';

  const Page = crowi.model('Page');

  /**
   * Create posts from imported data
   * @param pages = [{
   *    path: String,
   *    body: String,
   *    user: Object
   * }]
   */
  const createGrowiPages = (pages) => {
    let errors = [];

    return new Promise((resolve, reject) => {
      const promises = pages.map(page => {
        return new Promise(async(resolve, reject) => {
          const path = page.path;
          const user = page.user;
          const body = page.body;
          const isCreatableName = await Page.isCreatableName(path);
          const isPageNameTaken = await Page.findPage(path, user, null, true);

          if (isCreatableName && !isPageNameTaken) {
            try {
              await Page.create(path, body, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
            }
            catch (err) {
              errors.push(err);
            }
          }
          else {
            if (!isCreatableName) {
              errors.push(new Error(`${path} is not a creatable name in Growi`));
            }
            if (isPageNameTaken) {
              errors.push(new Error(`${path} already exists in Growi`));
            }
          }

          resolve();
        });
      });

      Promise.all(promises)
        .then(() => {
          resolve(errors);
        });
    });
  };

  return createGrowiPages;
};
