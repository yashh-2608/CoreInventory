import '../env';
import { PrismaClient } from '@prisma/client';

const missingDatabaseUrlError = () =>
  Object.assign(
    new Error('DATABASE_URL is not configured. Add it to backend/.env or the project root .env, then restart the backend.'),
    { code: 'CONFIG_MISSING_DATABASE_URL' }
  );

const prismaClient = process.env.DATABASE_URL ? new PrismaClient() : null;

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (!process.env.DATABASE_URL || !prismaClient) {
      throw missingDatabaseUrlError();
    }

    return Reflect.get(prismaClient as object, property);
  },
});

export default prisma;
