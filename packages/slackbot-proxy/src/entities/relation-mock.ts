import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import { Installation } from './installation';


// expected data see below
//   commandToChannelMap: {
//     create: ['srv', 'admin'],
//     search: ['admin'],
//   }
interface PermittedChannelsForEachCommand {
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

  @Column('simple-array')
  supportedCommandsForBroadcastUse: string[];

  @Column('simple-array')
  supportedCommandsForSingleUse: string[];

  @Column({ type: 'json' })
  permittedChannelsForEachCommand : PermittedChannelsForEachCommand

  @Column({ type: 'bigint' })
  expiredAtCommands: number;

  getDistanceInMillisecondsToExpiredAt(baseDate:Date):number {
    return this.expiredAtCommands - baseDate.getTime();
  }

}
