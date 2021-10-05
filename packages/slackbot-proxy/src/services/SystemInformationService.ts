import { Inject, Service } from '@tsed/di';

import readPkgUp from 'read-pkg-up';

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

  async $onInit(): Promise<void> {
    await this.onInitCheckVersion();
  }

  /*
   * updates version or create new system information record
   * make all relations expired if the previous version was <= 4.4.8
   */
  async onInitCheckVersion(): Promise<void> {
    const readPkgUpResult = await readPkgUp();
    const proxyVersion = readPkgUpResult?.packageJson.version;
    if (proxyVersion == null) return logger.error('version is null');

    const isExist = (await this.repository.findAndCount())[1] > 0;

    if (isExist) {
      const systemInfo = await this.repository.findOne();
      if (systemInfo == null) return;

      // make relations expired if version is updated
      if (!(systemInfo.version === proxyVersion)) {
        await this.relationsService.resetAllExpiredAtCommands();
      }

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
      await this.relationsService.resetAllExpiredAtCommands();
    }
  }

}
