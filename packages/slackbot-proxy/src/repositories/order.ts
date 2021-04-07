import {
  Repository, EntityRepository,
} from 'typeorm';

import { Order } from '~/entities/order';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

  async findOrCreateByTeamId(teamId:string):Promise<Order> {
    const order = await this.findOne({ teamId });

    if (order == null) {
      return this.save({ teamId });
    }

    return order;
  }

}
