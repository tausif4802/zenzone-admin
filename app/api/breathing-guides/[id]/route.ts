import { db } from '@/lib/db/index';
import { breathingGuides } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/breathing-guides/[id] - Get a specific breathing guide
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = parseInt(params.id);

    if (isNaN(guideId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guide ID' },
        { status: 400 }
      );
    }

    const guide = await db
      .select()
      .from(breathingGuides)
      .where(
        and(
          eq(breathingGuides.id, guideId),
          eq(breathingGuides.isDeleted, false)
        )
      )
      .limit(1);

    if (!guide.length) {
      return NextResponse.json(
        { success: false, error: 'Breathing guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide: guide[0],
    });
  } catch (error) {
    console.error('Error fetching breathing guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breathing guide' },
      { status: 500 }
    );
  }
}

// PUT /api/breathing-guides/[id] - Update a specific breathing guide
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = parseInt(params.id);

    if (isNaN(guideId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guide ID' },
        { status: 400 }
      );
    }

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

    // Check if guide exists and is not deleted
    const existingGuide = await db
      .select()
      .from(breathingGuides)
      .where(
        and(
          eq(breathingGuides.id, guideId),
          eq(breathingGuides.isDeleted, false)
        )
      )
      .limit(1);

    if (!existingGuide.length) {
      return NextResponse.json(
        { success: false, error: 'Breathing guide not found' },
        { status: 404 }
      );
    }

    // Check if serial number already exists (excluding current guide)
    if (serial && parseInt(serial) !== existingGuide[0].serial) {
      const existingSerial = await db
        .select()
        .from(breathingGuides)
        .where(
          and(
            eq(breathingGuides.serial, parseInt(serial)),
            eq(breathingGuides.isDeleted, false)
          )
        )
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
    }

    const updatedGuide = await db
      .update(breathingGuides)
      .set({
        serial: serial ? parseInt(serial) : existingGuide[0].serial,
        title: title || existingGuide[0].title,
        guide: guide || existingGuide[0].guide,
        description: description || existingGuide[0].description,
        audioUrl: audioUrl !== undefined ? audioUrl : existingGuide[0].audioUrl,
        duration: duration !== undefined ? duration : existingGuide[0].duration,
        isFeatured:
          isFeatured !== undefined ? isFeatured : existingGuide[0].isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(breathingGuides.id, guideId))
      .returning();

    return NextResponse.json({
      success: true,
      guide: updatedGuide[0],
    });
  } catch (error) {
    console.error('Error updating breathing guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update breathing guide' },
      { status: 500 }
    );
  }
}

// DELETE /api/breathing-guides/[id] - Soft delete a specific breathing guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guideId = parseInt(params.id);

    if (isNaN(guideId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guide ID' },
        { status: 400 }
      );
    }

    // Check if guide exists and is not already deleted
    const existingGuide = await db
      .select()
      .from(breathingGuides)
      .where(
        and(
          eq(breathingGuides.id, guideId),
          eq(breathingGuides.isDeleted, false)
        )
      )
      .limit(1);

    if (!existingGuide.length) {
      return NextResponse.json(
        { success: false, error: 'Breathing guide not found' },
        { status: 404 }
      );
    }

    // Soft delete the guide
    const deletedGuide = await db
      .update(breathingGuides)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(breathingGuides.id, guideId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Breathing guide deleted successfully',
      guide: deletedGuide[0],
    });
  } catch (error) {
    console.error('Error deleting breathing guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete breathing guide' },
      { status: 500 }
    );
  }
}
