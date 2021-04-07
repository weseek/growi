import {
  Repository, EntityRepository,
} from 'typeorm';

import { Order } from '~/entities/order';

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

  isExpired():Error {
    throw new Error('TODO GW-5555 implement this');
  }

}
