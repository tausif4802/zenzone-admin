import { db } from '@/lib/db/index';
import { breathingGuides } from '@/lib/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/breathing-guides:
 *   get:
 *     tags: [Breathing Guides]
 *     summary: Get all breathing guides
 *     description: Retrieve all breathing guides with optional filtering for featured and deleted items, and search functionality
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter for featured guides
 *       - in: query
 *         name: deleted
 *         schema:
 *           type: boolean
 *         description: Include deleted guides
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for guides (searches in title, description, and guide content)
 *     responses:
 *       200:
 *         description: List of breathing guides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 breathingGuides:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BreathingGuide'
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeFeatured = searchParams.get('featured') === 'true';
    const includeDeleted = searchParams.get('deleted') === 'true';
    const search = searchParams.get('search');

    const conditions = [];

    // Handle search functionality
    if (search) {
      const searchNumber = parseInt(search);
      if (!isNaN(searchNumber)) {
        // If search is a number, search by serial number
        conditions.push(eq(breathingGuides.serial, searchNumber));
      } else {
        // Otherwise search by title, description, and guide content
        conditions.push(
          or(
            like(breathingGuides.title, `%${search}%`),
            like(breathingGuides.description, `%${search}%`),
            like(breathingGuides.guide, `%${search}%`)
          )
        );
      }
    }

    // Handle other filters
    if (!includeDeleted) {
      conditions.push(eq(breathingGuides.isDeleted, false));
    }
    if (includeFeatured) {
      conditions.push(eq(breathingGuides.isFeatured, true));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const allGuides = whereCondition
      ? await db
          .select()
          .from(breathingGuides)
          .where(whereCondition)
          .orderBy(desc(breathingGuides.createdAt))
      : await db
          .select()
          .from(breathingGuides)
          .orderBy(desc(breathingGuides.createdAt));

    return NextResponse.json({
      success: true,
      breathingGuides: allGuides, // Changed from 'guides' to 'breathingGuides' for consistency
    });
  } catch (error) {
    console.error('Error fetching breathing guides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breathing guides' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/breathing-guides:
 *   post:
 *     tags: [Breathing Guides]
 *     summary: Create a new breathing guide
 *     description: Create a new breathing guide with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serial
 *               - title
 *               - guide
 *               - description
 *             properties:
 *               serial:
 *                 type: integer
 *                 description: Unique serial number for the guide
 *               title:
 *                 type: string
 *                 description: The guide title
 *               guide:
 *                 type: string
 *                 description: The breathing exercise instructions
 *               description:
 *                 type: string
 *                 description: Short description of the guide
 *               audioUrl:
 *                 type: string
 *                 description: URL of the guide's audio file
 *               duration:
 *                 type: integer
 *                 description: Duration of the exercise in seconds
 *               isFeatured:
 *                 type: boolean
 *                 description: Whether the guide is featured
 *     responses:
 *       200:
 *         description: Breathing guide created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 guide:
 *                   $ref: '#/components/schemas/BreathingGuide'
 *       400:
 *         description: Invalid request body or duplicate serial number
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serial,
      title,
      guide,
      description,
      audioUrl,
      duration,
      isFeatured,
    } = body;

    if (!serial || !title || !guide || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Serial, title, guide, and description are required',
        },
        { status: 400 }
      );
    }

    // Check if serial number already exists
    const existingSerial = await db
      .select()
      .from(breathingGuides)
      .where(eq(breathingGuides.serial, parseInt(serial)))
      .limit(1);

    if (existingSerial.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Serial number already exists. Please use a unique serial number.',
        },
        { status: 400 }
      );
    }

    const newGuide = await db
      .insert(breathingGuides)
      .values({
        serial: parseInt(serial),
        title,
        guide,
        description,
        audioUrl: audioUrl || null,
        duration: duration || null,
        isFeatured: isFeatured || false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      guide: newGuide[0],
    });
  } catch (error) {
    console.error('Error creating breathing guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create breathing guide' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     BreathingGuide:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The guide ID
 *         serial:
 *           type: integer
 *           description: Unique serial number for the guide
 *         title:
 *           type: string
 *           description: The guide title
 *         guide:
 *           type: string
 *           description: The breathing exercise instructions
 *         description:
 *           type: string
 *           description: Short description of the guide
 *         audioUrl:
 *           type: string
 *           description: URL of the guide's audio file
 *         duration:
 *           type: integer
 *           description: Duration of the exercise in seconds
 *         isFeatured:
 *           type: boolean
 *           description: Whether the guide is featured
 *         isDeleted:
 *           type: boolean
 *           description: Whether the guide is deleted
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: Deletion timestamp
 */
