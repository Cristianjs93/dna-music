import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  Role,
  StudentStatus,
  type Headquarter,
} from '../generated/prisma/index.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    '❌ DATABASE_URL no está definida en las variables de entorno para el seeder',
  );
}

const seedPool = new Pool({
  connectionString,
  max: 2,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(seedPool),
});

const PASSWORDS = {
  admin: 'Admin123!',
  operador: 'Oper123!',
} as const;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function seedHeadquarters(): Promise<{
  bogota: Headquarter;
  medellin: Headquarter;
  cali: Headquarter;
}> {
  const headquarters = [
    {
      name: 'Sede Bogotá',
      city: 'Bogotá',
      address: 'Carrera 15 # 88-64, Bogotá D.C.',
      isActive: true,
    },
    {
      name: 'Sede Medellín',
      city: 'Medellín',
      address: 'Calle 50 # 42-20, Medellín',
      isActive: true,
    },
    {
      name: 'Sede Cali',
      city: 'Cali',
      address: 'Av. 6N # 28-30, Cali',
      isActive: true,
    },
  ] as const;

  const [bogota, medellin, cali] = await Promise.all(
    headquarters.map((hq) =>
      prisma.headquarter.upsert({
        where: { name: hq.name },
        create: hq,
        update: { city: hq.city, address: hq.address, isActive: hq.isActive },
      }),
    ),
  );

  return { bogota, medellin, cali };
}

async function seedUsers(
  bogota: Headquarter,
  medellin: Headquarter,
): Promise<void> {
  const adminHash = await hashPassword(PASSWORDS.admin);
  const operadorHash = await hashPassword(PASSWORDS.operador);

  const users = [
    {
      email: 'admin@dnamusic.co',
      name: 'Administrador DNA Music',
      password: adminHash,
      role: Role.ADMIN,
      headquarterId: null,
    },
    {
      email: 'operador.bog@dnamusic.co',
      name: 'Operador Bogotá',
      password: operadorHash,
      role: Role.OPERADOR,
      headquarterId: bogota.id,
    },
    {
      email: 'operador.med@dnamusic.co',
      name: 'Operador Medellín',
      password: operadorHash,
      role: Role.OPERADOR,
      headquarterId: medellin.id,
    },
  ] as const;

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: user,
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        headquarterId: user.headquarterId,
      },
    });
  }
}

async function seedStudents(
  bogota: Headquarter,
  medellin: Headquarter,
  cali: Headquarter,
): Promise<void> {
  const students = [
    {
      identityCard: '1001111111',
      fullName: 'María Fernanda López Obrador',
      email: 'maria.lopez@estudiante.dnamusic.co',
      phone: '3001111111',
      program: 'Piano',
      status: StudentStatus.ACTIVO,
      headquarterId: bogota.id,
      enrollmentDate: new Date('2024-01-15'),
    },
    {
      identityCard: '1002222222',
      fullName: 'Carlos Andrés Ruiz Acevedo',
      email: 'carlos.ruiz@estudiante.dnamusic.co',
      phone: '3002222222',
      program: 'Guitarra',
      status: StudentStatus.INACTIVO,
      headquarterId: bogota.id,
      enrollmentDate: new Date('2023-08-20'),
    },
    {
      identityCard: '1003333333',
      fullName: 'Alberto Pérez López',
      email: 'alberto.perez@estudiante.dnamusic.co',
      phone: '3003333333',
      program: 'Producción Musical',
      status: StudentStatus.RETIRADO,
      headquarterId: bogota.id,
      enrollmentDate: new Date('2020-01-15'),
      deletedAt: new Date('2025-02-10'),
    },
    {
      identityCard: '1004444444',
      fullName: 'Valentina Gómez Sánchez',
      email: 'valentina.gomez@estudiante.dnamusic.co',
      phone: '3004444444',
      program: 'Canto',
      status: StudentStatus.ACTIVO,
      headquarterId: medellin.id,
      enrollmentDate: new Date('2024-03-10'),
    },
    {
      identityCard: '1005555555',
      fullName: 'Santiago Herrera Giraldo',
      email: 'santiago.herrera@estudiante.dnamusic.co',
      phone: '3005555555',
      program: 'Batería',
      status: StudentStatus.INACTIVO,
      headquarterId: medellin.id,
      enrollmentDate: new Date('2022-11-05'),
    },
    {
      identityCard: '1006666666',
      fullName: 'Vladimir Carrillo Henao',
      email: 'vlasimir.carrillo@estudiante.dnamusic.co',
      phone: '3006666666',
      program: 'Batería',
      status: StudentStatus.RETIRADO,
      headquarterId: medellin.id,
      enrollmentDate: new Date('2022-11-05'),
      deletedAt: new Date('2024-11-10'),
    },
    {
      identityCard: '1007777777',
      fullName: 'Isabella Torres Santana',
      email: 'isabella.torres@estudiante.dnamusic.co',
      phone: '3007777777',
      program: 'Violín',
      status: StudentStatus.ACTIVO,
      headquarterId: cali.id,
      enrollmentDate: new Date('2024-06-01'),
    },
    {
      identityCard: '1008888888',
      fullName: 'Juan Pablo Méndez Ortiz',
      email: 'juan.mendez@estudiante.dnamusic.co',
      phone: '3008888888',
      program: 'Producción Musical',
      status: StudentStatus.INACTIVO,
      headquarterId: cali.id,
      enrollmentDate: new Date('2023-02-28'),
    },
    {
      identityCard: '1009999999',
      fullName: 'Julian David Ramírez Castaño',
      email: 'julian.david@estudiante.dnamusic.co',
      phone: '3009999999',
      program: 'Canto',
      status: StudentStatus.RETIRADO,
      headquarterId: cali.id,
      enrollmentDate: new Date('2018-02-28'),
      deletedAt: new Date('2020-03-20'),
    },
  ] as const;

  for (const student of students) {
    await prisma.student.upsert({
      where: { identityCard: student.identityCard },
      create: student,
      update: {
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        program: student.program,
        status: student.status,
        headquarterId: student.headquarterId,
        enrollmentDate: student.enrollmentDate,
      },
    });
  }
}

async function main(): Promise<void> {
  console.log('🌱 Starting seeding process for DNA Music...');

  const { bogota, medellin, cali } = await seedHeadquarters();
  console.log('✅ Headquarters seeded successfully');

  await seedUsers(bogota, medellin);
  console.log('✅ Users seeded successfully');

  await seedStudents(bogota, medellin, cali);
  console.log('✅ Students seeded successfully');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Error executing seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔌 Disconnecting Prisma Client...');
    await prisma.$disconnect();
    await seedPool.end();
  });
