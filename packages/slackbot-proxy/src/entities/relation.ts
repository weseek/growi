import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import { Installation } from './installation';

@Entity()
@Index(['installation', 'growiUri'], { unique: true })
export class Relation {

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
  siglePostCommands: string[];

}
