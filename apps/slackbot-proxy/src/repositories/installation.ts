import {
  Repository, EntityRepository,
} from 'typeorm';

import { Installation } from '~/entities/installation';

@EntityRepository(Installation)
export class InstallationRepository extends Repository<Installation> {

  async findByTeamIdOrEnterpriseId(teamIdOrEnterpriseId:string): Promise<Installation|null> {
    return this.findOne({
      where: [
        { teamId: teamIdOrEnterpriseId },
        { enterpriseId: teamIdOrEnterpriseId, isEnterpriseInstall: true },
      ],
    });
  }

}
