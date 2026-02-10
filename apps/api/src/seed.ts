import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeePosition } from './employee/entities/employee.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'dexa',
    password: process.env.POSTGRES_PASSWORD || 'dexa_secret',
    database: process.env.POSTGRES_DB || 'dexa_db',
    entities: [Employee],
    synchronize: false,
  });

  await ds.initialize();
  const repo = ds.getRepository(Employee);
  const existing = await repo.findOne({ where: { email: 'admin@dexa.com' } });
  if (existing) {
    console.log('Admin user already exists');
    await ds.destroy();
    return;
  }
  const hashed = await bcrypt.hash('admin123', 10);
  await repo.save({
    name: 'Admin',
    email: 'admin@dexa.com',
    password: hashed,
    position: EmployeePosition.ADMIN,
  });
  console.log('Created admin@dexa.com / admin123');
  await ds.destroy();
}

seed().catch(console.error);
