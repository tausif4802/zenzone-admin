import { db } from '@/lib/db/index';
import { breathingGuides } from '@/lib/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/breathing-guides - Get all breathing guides (non-deleted) with search support
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

// POST /api/breathing-guides - Create a new breathing guide
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
