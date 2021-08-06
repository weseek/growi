import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import { Installation } from './installation';


// set PermittedChannel interface this file because this is mock
// expected data see below
// channelsObject:{
//   create: ['srv', 'admin'],
//   search: ['admin'],
// }
interface PermittedChannel {
  commandToChannelMap: { [command: string]: string[] };
}

@Entity()
@Index(['installation', 'growiUri'], { unique: true })
export class RelationMock {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Installation)
  readonly installation: Installation;

  @Column()
  @Index({ unique: true })
  tokenGtoP: string;

  @Column()
  @Index()
  tokenPtoG: string;

  @Column()
  growiUri: string;

  @Column({ type: 'json' })
  permittedChannel: PermittedChannel

  @Column('simple-array')
  singlePostCommands: string[];

}
