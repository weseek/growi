import path from 'path';

import { Lang } from '@growi/core';
import type { IPage, IUser } from '@growi/core';
import { addSeconds } from 'date-fns';
import ExtensibleCustomError from 'extensible-custom-error';
import fs from 'graceful-fs';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

import { generateConfigsForInstalling } from '../models/config';

import type { ConfigManager } from './config-manager';
import SearchService from './search';

const logger = loggerFactory('growi:service:installer');

export class FailedToCreateAdminUserError extends ExtensibleCustomError {
}

export type AutoInstallOptions = {
  allowGuestMode?: boolean,
  serverDate?: Date,
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

    try {
      await searchService.rebuildIndex();
    }
    catch (err) {
      logger.error('Rebuild index failed', err);
    }
  }

  private async createPage(filePath, pagePath, owner): Promise<IPage|undefined> {
    try {
      const markdown = fs.readFileSync(filePath);
      return this.crowi.pageService.create(pagePath, markdown, owner, { isSynchronously: true }) as IPage;
    }
    catch (err) {
      logger.error(`Failed to create ${pagePath}`, err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createInitialPages(owner, lang: Lang, initialPagesCreatedAt?: Date): Promise<any> {
    const { localeDir } = this.crowi;
    // create /Sandbox/*
    /*
     * Keep in this order to
     *   1. avoid creating the same pages
     *   2. avoid difference for order in VRT
     */
    await this.createPage(path.join(localeDir, lang, 'sandbox.md'), '/Sandbox', owner);
    await this.createPage(path.join(localeDir, lang, 'sandbox-bootstrap4.md'), '/Sandbox/Bootstrap4', owner);
    await this.createPage(path.join(localeDir, lang, 'sandbox-diagrams.md'), '/Sandbox/Diagrams', owner);
    await this.createPage(path.join(localeDir, lang, 'sandbox-math.md'), '/Sandbox/Math', owner);

    // update createdAt and updatedAt fields of all pages
    if (initialPagesCreatedAt != null) {
      try {
        // TODO typescriptize models/user.js and remove eslint-disable-next-line
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Page = mongoose.model('Page') as any;

        // Increment timestamp to avoid difference for order in VRT
        const pagePaths = ['/Sandbox', '/Sandbox/Bootstrap4', '/Sandbox/Diagrams', '/Sandbox/Math'];
        const promises = pagePaths.map(async(path: string, idx: number) => {
          const date = addSeconds(initialPagesCreatedAt, idx);
          return Page.update(
            { path },
            {
              createdAt: date,
              updatedAt: date,
            },
          );
        });
        await Promise.all(promises);
      }
      catch (err) {
        logger.error('Failed to update createdAt', err);
      }
    }

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
  private async initDB(globalLang: Lang, options?: AutoInstallOptions): Promise<void> {
    const configManager: ConfigManager = this.crowi.configManager;

    const initialConfig = generateConfigsForInstalling();
    initialConfig['app:globalLang'] = globalLang;

    if (options?.allowGuestMode) {
      initialConfig['security:restrictGuestMode'] = 'Readonly';
    }

    return configManager.updateConfigsInTheSameNamespace('crowi', initialConfig, true);
  }

  async install(firstAdminUserToSave: Pick<IUser, 'name' | 'username' | 'email' | 'password'>, globalLang: Lang, options?: AutoInstallOptions): Promise<IUser> {
    await this.initDB(globalLang, options);

    // TODO typescriptize models/user.js and remove eslint-disable-next-line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const User = mongoose.model('User') as any;
    const Page = mongoose.model('Page') as any;

    // create portal page for '/' before creating admin user
    await this.createPage(
      path.join(this.crowi.localeDir, globalLang, 'welcome.md'),
      '/',
      { _id: '000000000000000000000000' }, // use 0 as a mock user id
    );

    // create first admin user
    // TODO: with transaction
    let adminUser;
    try {
      const {
        name, username, email, password,
      } = firstAdminUserToSave;
      adminUser = await User.createUser(name, username, email, password, globalLang);
      await adminUser.asyncGrantAdmin();
    }
    catch (err) {
      throw new FailedToCreateAdminUserError(err);
    }

    // add owner after creating admin user
    const Revision = this.crowi.model('Revision');
    const rootPage = await Page.findOne({ path: '/' });
    const rootRevision = await Revision.findOne({ path: '/' });
    rootPage.creator = adminUser._id;
    rootPage.lastUpdateUser = adminUser._id;
    rootRevision.author = adminUser._id;
    await Promise.all([rootPage.save(), rootRevision.save()]);

    // create initial pages
    await this.createInitialPages(adminUser, globalLang, options?.serverDate);

    return adminUser;
  }

}
