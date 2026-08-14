import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  mobile: string;

  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
