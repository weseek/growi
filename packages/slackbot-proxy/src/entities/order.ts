import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToOne,
} from 'typeorm';
import { Installation } from './installation';
import { Relation } from './relation';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Installation, installation => installation.orders)
  readonly installation: number;

  @OneToOne(() => Relation, relation => relation.order)
  relation: Relation;

  @Column({ nullable: true, default: false })
  isCompleted?: boolean;

  @Column({ nullable: true })
  growiUrl?: string;

  @Column({ nullable: true })
  growiAccessToken?: string;

  @Column({ nullable: true })
  proxyAccessToken?: string;

  isExpired():boolean {
    // TODO GW-5555 implement this
    return false;
  }

}
