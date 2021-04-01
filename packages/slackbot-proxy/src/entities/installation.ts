import {
  Property, Required,
} from '@tsed/schema';
import {
  Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

import { Installation as SlackInstallation } from '@slack/oauth';

@Entity()
export class Installation {

  @PrimaryGeneratedColumn()
  @Property()
  id: number;

  @Column({ type: 'json' })
  @Required()
  data: SlackInstallation;

}
