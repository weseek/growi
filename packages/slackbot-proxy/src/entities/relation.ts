import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn,
} from 'typeorm';
import { Installation } from './installation';
import { Order } from './order';

@Entity()
export class Relation {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Installation, installation => installation.relations)
  readonly installation: number;

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;

  @Column()
  tokenGtoP: string;

  @Column()
  tokenPtoG: string;

  @Column()
  growiUri: string;

}
