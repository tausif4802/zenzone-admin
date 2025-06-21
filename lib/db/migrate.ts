import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import { db } from './index';

export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'lib/db/migrations'),
    });

    console.log('Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    await runMigrations();
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return {
      success: false,
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
