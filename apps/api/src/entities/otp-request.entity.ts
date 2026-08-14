import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'otp_requests' })
export class OtpRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  otp_hash: string;

  @Column({ default: false })
  consumed: boolean;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
