import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { User } from './user'

@Entity('auth')
export class Auth extends BaseEntity {
  // @PrimaryGeneratedColumn('uuid')
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  email!: string

  @Column()
  password!: string

  @OneToOne(type => User)
  @JoinColumn({ name: 'userId' })
  user?: User
}
