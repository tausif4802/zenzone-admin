import { initializeDatabase } from '@/lib/db/migrate';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await initializeDatabase();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      {
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
