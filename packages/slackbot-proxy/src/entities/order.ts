import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @Column()
  teamId: string;

  @Column({ nullable: true, default: false })
  isCompleted?: boolean;

  @Column({ nullable: true })
  growiUrl?: string;

  @Column({ nullable: true })
  growiAccessToken?: string;

  @Column({ nullable: true })
  proxyAccessToken?: string;

}
