import { Inject, Service } from '@tsed/di';

import compareVersions from 'compare-versions';
import pkg from '../../package.json';

import { SystemInformation } from '~/entities/system-information';
import { SystemInformationRepository } from '~/repositories/system-information';
import { RelationsService } from './RelationsService';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:SystemInformationService');

@Service()
export class SystemInformationService {

  @Inject()
  private readonly repository: SystemInformationRepository;

  @Inject()
  relationsService: RelationsService;

  async $onInit(): Promise<any> {
    await this.onInitCheckVersion();
  }

  /*
   * updates version or create new system information record
   * make all relations expired if the previous version was <= 4.4.8
   */
  async onInitCheckVersion(): Promise<void> {
    const proxyVersion: string = pkg.version;
    const isExist = (await this.repository.findAndCount())[1] > 0;

    if (isExist) {
      const systemInfo = await this.repository.findOne();
      if (systemInfo == null) return;

      // make relations expired
      await this.expireIfVersionLowerThan448(systemInfo.version);

      // update the version
      systemInfo.setVersion(proxyVersion);
      await this.repository.save(systemInfo);
    }
    else {
      // create new system information object if it didn't exist
      const newSystemInfo = new SystemInformation();
      newSystemInfo.setVersion(proxyVersion);
      await this.repository.save(newSystemInfo);

      // make relations expired
      await this.expireIfVersionLowerThan448(proxyVersion);
    }
  }

  async expireIfVersionLowerThan448(proxyVersion: string): Promise<void> {
    const versionRegExp = /^\d{1,2}.\d{1,2}.\d{1,2}/g;
    const version = proxyVersion.match(versionRegExp)?.[0];
    if (version == null) return logger.error('version is null');

    // make all relations expired if the previous version was <= 4.4.8
    const shouldExpire = compareVersions(version, '4.4.8') <= 0;
    if (shouldExpire) {
      await this.relationsService.resetAllExpiredAtCommands();
    }
  }

}
