import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { Installation } from './installation';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Installation)
  readonly installation: Installation;

  @Column({ nullable: true, default: false })
  isCompleted?: boolean;

  @Column()
  growiUrl: string;

  @Column()
  growiAccessToken: string;

  @Column()
  proxyAccessToken: string;

  isExpired():boolean {
    // TODO GW-5555 implement this
    return false;
  }

}
