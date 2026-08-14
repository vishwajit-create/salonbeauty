import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Salon } from './salon.entity';

@Entity({ name: 'salon_addresses' })
export class SalonAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Salon)
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;
}
