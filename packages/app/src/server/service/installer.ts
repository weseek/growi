import mongoose from 'mongoose';
import fs from 'graceful-fs';
import path from 'path';
import ExtensibleCustomError from 'extensible-custom-error';

import { IPage } from '~/interfaces/page';
import { IUser } from '~/interfaces/user';
import { Lang } from '~/interfaces/lang';
import loggerFactory from '~/utils/logger';

import { generateConfigsForInstalling } from '../models/config';

import SearchService from './search';
import ConfigManager from './config-manager';

const logger = loggerFactory('growi:service:installer');

export class FailedToCreateAdminUserError extends ExtensibleCustomError {
}

export class InstallerService {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crowi: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  constructor(crowi: any) {
    this.crowi = crowi;
  }

  private async initSearchIndex() {
    const searchService: SearchService = this.crowi.searchService;
    if (!searchService.isReachable) {
      return;
    }

    await searchService.rebuildIndex();
  }

  private async createPage(filePath, pagePath, owner): Promise<IPage|undefined> {

    // TODO typescriptize models/user.js and remove eslint-disable-next-line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Page = mongoose.model('Page') as any;

    try {
      const markdown = fs.readFileSync(filePath);
      return Page.create(pagePath, markdown, owner, {}) as IPage;
    }
    catch (err) {
      logger.error(`Failed to create ${pagePath}`, err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createInitialPages(owner, lang: Lang): Promise<any> {
    const { localeDir } = this.crowi;
    // create /Sandbox/*
    /*
     * Keep in this order to avoid creating the same pages
     */
    await this.createPage(path.join(localeDir, lang, 'sandbox.md'), '/Sandbox', owner);
    await Promise.all([
      this.createPage(path.join(localeDir, lang, 'sandbox-diagrams.md'), '/Sandbox/Diagrams', owner),
      this.createPage(path.join(localeDir, lang, 'sandbox-bootstrap4.md'), '/Sandbox/Bootstrap4', owner),
      this.createPage(path.join(localeDir, lang, 'sandbox-math.md'), '/Sandbox/Math', owner),
    ]);

    try {
      await this.initSearchIndex();
    }
    catch (err) {
      logger.error('Failed to build Elasticsearch Indices', err);
    }
  }

  /**
   * Execute only once for installing application
   */
  private async initDB(globalLang: Lang): Promise<void> {
    const configManager: ConfigManager = this.crowi.configManager;

    const initialConfig = generateConfigsForInstalling();
    initialConfig['app:globalLang'] = globalLang;
    return configManager.updateConfigsInTheSameNamespace('crowi', initialConfig, true);
  }

  async install(firstAdminUserToSave: IUser, globalLang: Lang): Promise<IUser> {
    await this.initDB(globalLang);

    // TODO typescriptize models/user.js and remove eslint-disable-next-line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const User = mongoose.model('User') as any;
    const Page = mongoose.model('Page') as any;

    // create portal page for '/' before creating admin user
    await this.createPage(path.join(this.crowi.localeDir, globalLang, 'welcome.md'), '/', { _id: '000000000000000000000000' }); // use 0 as a mock user id

    // create first admin user
    // TODO: with transaction
    let adminUser;
    try {
      const {
        name, username, email, password,
      } = firstAdminUserToSave;
      adminUser = await User.createUser(name, username, email, password, globalLang);
      await adminUser.asyncMakeAdmin();
    }
    catch (err) {
      throw new FailedToCreateAdminUserError(err);
    }

    // add owner after creating admin user
    const Revision = this.crowi.model('Revision');
    const rootPage = await Page.findOne({ path: '/' });
    const rootRevision = await Revision.findOne({ path: '/' });
    rootPage.creator = adminUser._id;
    rootRevision.creator = adminUser._id;
    await Promise.all([rootPage.save(), rootRevision.save()]);

    // create initial pages
    await this.createInitialPages(adminUser, globalLang);

    return adminUser;
  }

}
