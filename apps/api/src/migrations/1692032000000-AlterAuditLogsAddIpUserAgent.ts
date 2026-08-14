import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAuditLogsAddIpUserAgent1692032000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('audit_logs', new TableColumn({ name: 'ip', type: 'varchar', isNullable: true }));
    await queryRunner.addColumn('audit_logs', new TableColumn({ name: 'user_agent', type: 'varchar', isNullable: true }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('audit_logs', 'user_agent');
    await queryRunner.dropColumn('audit_logs', 'ip');
  }
}
