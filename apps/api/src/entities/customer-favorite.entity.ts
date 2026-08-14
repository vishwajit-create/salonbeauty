import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'customer_favorites' })
export class CustomerFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  salon_id: string;
}
