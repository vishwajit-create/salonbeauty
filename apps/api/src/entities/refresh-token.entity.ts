import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  token_hash: string;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  replaced_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
