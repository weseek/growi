import {
  Repository, EntityRepository,
} from 'typeorm';

import { SystemInformation } from '~/entities/system-information';

@EntityRepository(SystemInformation)
export class SystemInformationRepository extends Repository<SystemInformation> {

  async createOrUpdateUniqueRecordWithVersion(systemInfo: SystemInformation | undefined, proxyVersion: string): Promise<void> {
    const isExist = systemInfo != null;
    // update the version if it exists
    if (isExist) {
      systemInfo.setVersion(proxyVersion);
      await this.save(systemInfo);
      return;
    }
    // create new system information object if it didn't exist
    const newSystemInfo = new SystemInformation();
    newSystemInfo.setVersion(proxyVersion);
    await this.save(newSystemInfo);
  }

}
