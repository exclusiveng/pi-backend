import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToWalletPhrase1766830028770 implements MigrationInterface {
    name = 'AddUniqueConstraintToWalletPhrase1766830028770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_phrase" ADD CONSTRAINT "UQ_03ab0589a14fb0045ee8e7becfa" UNIQUE ("passphrase")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_phrase" DROP CONSTRAINT "UQ_03ab0589a14fb0045ee8e7becfa"`);
    }

}
