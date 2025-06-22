import { authenticateUser } from '@/lib/auth-drizzle';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in user
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authentication successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        lastWatched: user.lastWatched,
        lastRead: user.lastRead,
      },
    });
  } catch (error) {
    console.error('Signin failed:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *         status:
 *           type: string
 *           enum: [regular, premium]
 *           description: User's status
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's address
 *         lastWatched:
 *           type: string
 *           format: date-time
 *           description: Last watched content timestamp
 *         lastRead:
 *           type: string
 *           format: date-time
 *           description: Last read content timestamp
 */
