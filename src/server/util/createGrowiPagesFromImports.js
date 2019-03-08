module.exports = (crowi) => {
  const Page = crowi.model('Page');

  /**
   * Create posts from imported data
   * @param pages = [{
   *    path: String,
   *    body: String,
   *    user: Object
   * }]
   */
  const createGrowiPages = async(pages) => {
    const promises = [];
    const errors = [];

    /* eslint-disable no-await-in-loop */
    for (const page of pages) {
      const path = page.path;
      const user = page.user;
      const body = page.body;
      const isCreatableName = await Page.isCreatableName(path);
      const isPageNameTaken = await Page.findByPathAndViewer(path, user);

      if (isCreatableName && !isPageNameTaken) {
        try {
          const promise = Page.create(path, body, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
          promises.push(promise);
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
    }
    /* eslint-enable no-await-in-loop */

    await Promise.all(promises);

    return errors;
  };

  return createGrowiPages;
};
