import { MigrationInterface, QueryRunner } from 'typeorm';

export class RankedName1688216624233 implements MigrationInterface {
  name = 'RankedName1688216624233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ranked_name" (
        "id" SERIAL NOT NULL, 
        "name" character varying NOT NULL, 
        "next" character varying, 
        CONSTRAINT "UQ_eb79acd34ebc3925cbc27bfafa0" UNIQUE ("name"), 
        CONSTRAINT "UQ_62e66e8225daaefa633b91b7a60" UNIQUE ("next"), 
        CONSTRAINT "PK_1f4f829bca28fc1a71330e1dd83" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ranked_name"`);
  }
}
