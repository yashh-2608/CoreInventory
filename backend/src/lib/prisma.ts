import '../env';
import { PrismaClient } from '@prisma/client';

const missingDatabaseUrlError = () =>
  Object.assign(
    new Error('DATABASE_URL is not configured. Add it to backend/.env or the project root .env, then restart the backend.'),
    { code: 'CONFIG_MISSING_DATABASE_URL' }
  );

// Robust initialization with pooling detection
const initializePrisma = () => {
  let url = process.env.DATABASE_URL;
  if (!url) return null;

  // Supabase/PgBouncer check: Force ?pgbouncer=true if it's a Supabase URL and missing
  // This ensures stability even if the user hasn't updated their environment variables yet.
  if (url.includes('supabase.co') && !url.includes('pgbouncer=true')) {
    console.log('\x1b[36m%s\x1b[0m', '🔧 System: Auto-injecting ?pgbouncer=true for Supabase stability...');
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pgbouncer=true`;
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    },
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
