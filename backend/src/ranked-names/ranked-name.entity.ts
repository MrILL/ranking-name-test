import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RankedName {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  next: string;
}
