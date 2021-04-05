import {
  Property, Required,
} from '@tsed/schema';
import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

import { Installation as SlackInstallation } from '@slack/oauth';

@Entity()
export class Installation {

  @PrimaryGeneratedColumn()
  @Property()
  readonly id: number;

  @Column({ type: 'json' })
  @Required()
  data: SlackInstallation;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

}
