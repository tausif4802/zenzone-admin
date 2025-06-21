import {
  findUserById,
  updateLastRead,
  updateLastWatched,
  updateUserProfile,
} from '@/lib/auth-drizzle';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  userId: z.number(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateActivitySchema = z.object({
  userId: z.number(),
  type: z.enum(['watched', 'read']),
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user's profile
 *     description: Retrieve the profile of the currently authenticated user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update the profile of the currently authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's address
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, ...updates } = validation.data;

    const user = await updateUserProfile(userId, updates);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Update user activity (last watched/read)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = updateActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, type } = validation.data;

    if (type === 'watched') {
      await updateLastWatched(userId);
    } else {
      await updateLastRead(userId);
    }

    const user = await findUserById(userId);

    return NextResponse.json({
      success: true,
      message: `Last ${type} updated successfully`,
      user,
    });
  } catch (error) {
    console.error('Activity update failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await findUserById(parseInt(userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
