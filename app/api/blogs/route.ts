import { db } from '@/lib/db/index';
import { blogs } from '@/lib/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs - Get all blogs (non-deleted) with search support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeFeatured = searchParams.get('featured') === 'true';
    const includeDeleted = searchParams.get('deleted') === 'true';
    const search = searchParams.get('search');

    const conditions = [];

    // Handle search functionality
    if (search) {
      conditions.push(
        or(
          like(blogs.title, `%${search}%`),
          like(blogs.description, `%${search}%`),
          like(blogs.body, `%${search}%`)
        )
      );
    }

    // Handle featured filter
    if (includeFeatured && !includeDeleted) {
      conditions.push(eq(blogs.isFeatured, true));
      conditions.push(eq(blogs.isDeleted, false));
    } else if (includeFeatured && includeDeleted) {
      conditions.push(eq(blogs.isFeatured, true));
    } else if (!includeDeleted) {
      conditions.push(eq(blogs.isDeleted, false));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const allBlogs = whereCondition
      ? await db
          .select()
          .from(blogs)
          .where(whereCondition)
          .orderBy(desc(blogs.createdAt))
      : await db.select().from(blogs).orderBy(desc(blogs.createdAt));

    return NextResponse.json({
      success: true,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, body: blogBody, imageUrl, isFeatured } = body;

    if (!title || !description || !blogBody) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and body are required' },
        { status: 400 }
      );
    }

    const newBlog = await db
      .insert(blogs)
      .values({
        title,
        description,
        body: blogBody,
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      blog: newBlog[0],
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
