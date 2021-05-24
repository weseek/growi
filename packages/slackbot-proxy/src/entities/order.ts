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

  @Column({ nullable: true })
  growiUrl?: string;

  @Column({ nullable: true })
  growiAccessToken?: string;

  @Column({ nullable: true })
  proxyAccessToken?: string;

  isExpired():boolean {
    const createdTime = (new Date(this.createdAt)).getTime();
    const currentTime = (new Date()).getTime();
    console.log('createdTime', createdTime);
    console.log('currentTime', currentTime);
    if (this.createdAt != null && currentTime < createdTime + 600000) {
      console.log('isExpiredです');
      return true;
    }
    console.log('isNotExpiredです');
    return false;
  }

}
