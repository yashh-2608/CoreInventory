import '../env';
import { PrismaClient } from '@prisma/client';

const missingDatabaseUrlError = () =>
  Object.assign(
    new Error('DATABASE_URL is not configured. Add it to backend/.env or the project root .env, then restart the backend.'),
    { code: 'CONFIG_MISSING_DATABASE_URL' }
  );

// Robust initialization with pooling detection
const initializePrisma = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  // Supabase check: If using pooled connection without ?pgbouncer=true, it will fail with "prepared statement already exists"
  if (url.includes('supabase.co') && !url.includes('pgbouncer=true')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: Supabase connection detected without ?pgbouncer=true');
    console.warn('\x1b[33m%s\x1b[0m', '   To avoid "prepared statement already exists" errors, please append ?pgbouncer=true to your DATABASE_URL');
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const prismaClient = initializePrisma();

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (!process.env.DATABASE_URL || !prismaClient) {
      throw missingDatabaseUrlError();
    }

    return Reflect.get(prismaClient as object, property);
  },
});

export default prisma;
