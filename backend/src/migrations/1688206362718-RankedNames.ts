import { MigrationInterface, QueryRunner } from 'typeorm';

export class RankedNames1688206362718 implements MigrationInterface {
  name = 'RankedNames1688206362718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ranked_name" ("name" character varying NOT NULL, "next" character varying NOT NULL, CONSTRAINT "UQ_62e66e8225daaefa633b91b7a60" UNIQUE ("next"), CONSTRAINT "PK_eb79acd34ebc3925cbc27bfafa0" PRIMARY KEY ("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ranked_name"`);
  }
}
