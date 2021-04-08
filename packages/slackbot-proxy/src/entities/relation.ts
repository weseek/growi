import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { Installation } from './installation';

@Entity()
export class Relation {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Installation, installation => installation.relations)
  readonly installation: number;

  @Column({ nullable: true, default: false })
  isCompleted?: boolean;

  @Column()
  tokenGtoP: string;

  @Column()
  tokenPtoG: string;

  @Column()
  growiUri: string;

}
