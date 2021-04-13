import {
  Repository, EntityRepository,
} from 'typeorm';

import { Installation } from '~/entities/installation';

@EntityRepository(Installation)
export class InstallationRepository extends Repository<Installation> {

  findByID(id: string): Promise<Installation | undefined> {
    return this.findOne(id);
  }

}
