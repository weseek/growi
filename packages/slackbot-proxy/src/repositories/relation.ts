import {
  Repository, EntityRepository,
} from 'typeorm';

import { Relation } from '~/entities/relation';

@EntityRepository(Relation)
export class RelationRepository extends Repository<Relation> {

}
