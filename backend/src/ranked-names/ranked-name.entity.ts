import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class RankedName {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  next: string;
}
