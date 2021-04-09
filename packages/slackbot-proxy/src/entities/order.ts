import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToOne,
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
  readonly installation: number;

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
