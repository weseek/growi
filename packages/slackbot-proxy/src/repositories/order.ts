import {
  Repository, EntityRepository,
} from 'typeorm';

import { Order } from '~/entities/order';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

  createByTeamId(teamId:string):Order {
    return this.create({ teamId });
  }

}
