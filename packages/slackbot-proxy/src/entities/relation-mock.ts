import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import { differenceInMilliseconds } from 'date-fns';
import { Installation } from './installation';

interface PermissionSettingsInterface {
  [commandName: string]: boolean | string[],
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
  permissionSettingsForBroadcastUseCommands: PermissionSettingsInterface;

  @Column({ type: 'json' })
  permissionSettingsForSingleUseCommands: PermissionSettingsInterface;

  @CreateDateColumn()
  expiredAtCommands: Date;

  isExpiredCommands():boolean {
    const now = Date.now();
    return this.expiredAtCommands.getTime() < now;
  }

  getDistanceInMillisecondsToExpiredAt(baseDate:Date):number {
    return differenceInMilliseconds(this.expiredAtCommands, baseDate);
  }

}
