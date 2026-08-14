import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class UsersExtras1692033000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'otp_requests',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'mobile', type: 'varchar', isNullable: true },
        { name: 'email', type: 'varchar', isNullable: true },
        { name: 'otp_hash', type: 'varchar' },
        { name: 'consumed', type: 'boolean', default: false },
        { name: 'ip', type: 'varchar', isNullable: true },
        { name: 'user_agent', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'refresh_tokens',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid' },
        { name: 'token_hash', type: 'varchar' },
        { name: 'revoked', type: 'boolean', default: false },
        { name: 'replaced_by', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'user_sessions',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid' },
        { name: 'device', type: 'varchar', isNullable: true },
        { name: 'ip', type: 'varchar', isNullable: true },
        { name: 'user_agent', type: 'varchar', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'last_active', type: 'timestamp', isNullable: true },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'customer_profiles',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid' },
        { name: 'gender', type: 'varchar', isNullable: true },
        { name: 'dob', type: 'varchar', isNullable: true },
        { name: 'preferences', type: 'text', isNullable: true },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'customer_addresses',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid' },
        { name: 'label', type: 'varchar' },
        { name: 'address', type: 'text', isNullable: true },
        { name: 'area', type: 'varchar', isNullable: true },
        { name: 'city', type: 'varchar', isNullable: true },
        { name: 'state', type: 'varchar', isNullable: true },
        { name: 'pincode', type: 'varchar', isNullable: true },
        { name: 'latitude', type: 'double precision', isNullable: true },
        { name: 'longitude', type: 'double precision', isNullable: true },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'customer_favorites',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid' },
        { name: 'salon_id', type: 'uuid' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customer_favorites');
    await queryRunner.dropTable('customer_addresses');
    await queryRunner.dropTable('customer_profiles');
    await queryRunner.dropTable('user_sessions');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('otp_requests');
  }
}
