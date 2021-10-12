import {
  Repository, EntityRepository,
} from 'typeorm';

import { Relation } from '~/entities/relation';

@EntityRepository(Relation)
export class RelationRepository extends Repository<Relation> {

  async findOneByGrowiUri(growiUri: string): Promise<Relation | undefined> {
    return this.findOne({ growiUri });
  }

  async findAllByGrowiUris(growiUris: string[]): Promise<Relation[]> {
    return this.find({ where: growiUris.map(uri => ({ growiUri: uri })) });
  }

}
