import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize Neon connection
// DATABASE_URL should be set in environment variables (.env.local)
// Format: postgresql://user:password@host/database?sslmode=require

// Use a placeholder URL if not set (for build time)
const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder?sslmode=require';

const sql = neon(databaseUrl);

// Create Drizzle ORM instance with schema
export const db = drizzle(sql, { schema });

// Export schema for easy access
export * from './schema';
