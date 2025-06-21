import { db, testConnection } from '@/lib/db/index';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Example query to get database info using Drizzle
    const result = await db.execute(sql`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as postgresql_version,
        NOW() as current_time
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Example POST route showing how to handle data insertion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Data processed successfully (Drizzle ready)',
      drizzleEnabled: true,
    });
  } catch (error) {
    console.error('POST request failed:', error);
    return NextResponse.json(
      {
        error: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
