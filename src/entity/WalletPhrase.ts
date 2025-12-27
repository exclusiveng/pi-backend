import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class WalletPhrase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  passphrase!: string;

  @CreateDateColumn()
  createdAt!: Date;
}