import {
  Repository, EntityRepository,
} from 'typeorm';

import { RelationMock } from '~/entities/relation-mock';

@EntityRepository(RelationMock)
export class RelationMockRepository extends Repository<RelationMock> {

}
