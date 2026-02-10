import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeePosition {
  STAFF = 'staff',
  ADMIN = 'admin',
}

@Entity('tbl_employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: EmployeePosition,
  })
  position: EmployeePosition;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
