import { updateUserRole } from '@/lib/auth-drizzle';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let whereCondition;
    const conditions = [];

    // Search functionality
    if (search) {
      conditions.push(
        or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
      );
    }

    // Role filter
    if (role && (role === 'admin' || role === 'user')) {
      conditions.push(eq(users.role, role));
    }

    // Status filter
    if (status && (status === 'regular' || status === 'premium')) {
      conditions.push(eq(users.status, status));
    }

    if (conditions.length > 0) {
      whereCondition =
        conditions.length === 1 ? conditions[0] : and(...conditions);
    }

    const allUsers = whereCondition
      ? await db
          .select()
          .from(users)
          .where(whereCondition)
          .orderBy(desc(users.createdAt))
      : await db.select().from(users).orderBy(desc(users.createdAt));

    // Remove password hash from response
    const sanitizedUsers = allUsers.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Update user role (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "user"' },
        { status: 400 }
      );
    }

    const user = await updateUserRole(userId, role);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user role failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
