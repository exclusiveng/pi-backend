import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class WalletPhrase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  passphrase!: string;

  @CreateDateColumn()
  createdAt!: Date;
}