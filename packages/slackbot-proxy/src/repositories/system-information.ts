import {
  Repository, EntityRepository,
} from 'typeorm';

import { SystemInformation } from '~/entities/system-information';

@EntityRepository(SystemInformation)
export class SystemInformationRepository extends Repository<SystemInformation> {

}
