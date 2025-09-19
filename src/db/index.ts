import { drizzle } from 'drizzle-orm/neon-http';

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.warn('⚠️  DATABASE_URL not set, using mock data for development');
        console.warn('To use real database, create .env.local with: DATABASE_URL="postgresql://..."');
        // Return a mock object that will be handled by the tRPC router
        return () => {
          throw new Error('Database not available - using mock data');
        };
      }
      
      _db = drizzle(databaseUrl);
    }
    
    return _db[prop as keyof typeof _db];
  }
});
