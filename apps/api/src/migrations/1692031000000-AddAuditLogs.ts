import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddAuditLogs1692031000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'audit_logs',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'action', type: 'varchar' },
        { name: 'details', type: 'json', isNullable: true },
        { name: 'performed_by', type: 'uuid', isNullable: true },
        { name: 'salon_id', type: 'uuid', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
    }), true);

    await queryRunner.createForeignKey('audit_logs', new TableForeignKey({ columnNames: ['performed_by'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
    await queryRunner.createForeignKey('audit_logs', new TableForeignKey({ columnNames: ['salon_id'], referencedTableName: 'salons', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
