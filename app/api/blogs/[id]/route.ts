import { db } from '@/lib/db/index';
import { blogs } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/[id] - Get a specific blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = parseInt(params.id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.id, blogId), eq(blogs.isDeleted, false)))
      .limit(1);

    if (!blog.length) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blog: blog[0],
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update a specific blog
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = parseInt(params.id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, body: blogBody, imageUrl, isFeatured } = body;

    // Check if blog exists and is not deleted
    const existingBlog = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.id, blogId), eq(blogs.isDeleted, false)))
      .limit(1);

    if (!existingBlog.length) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updatedBlog = await db
      .update(blogs)
      .set({
        title: title || existingBlog[0].title,
        description: description || existingBlog[0].description,
        body: blogBody || existingBlog[0].body,
        imageUrl: imageUrl !== undefined ? imageUrl : existingBlog[0].imageUrl,
        isFeatured:
          isFeatured !== undefined ? isFeatured : existingBlog[0].isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, blogId))
      .returning();

    return NextResponse.json({
      success: true,
      blog: updatedBlog[0],
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Soft delete a specific blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = parseInt(params.id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // Check if blog exists and is not already deleted
    const existingBlog = await db
      .select()
      .from(blogs)
      .where(and(eq(blogs.id, blogId), eq(blogs.isDeleted, false)))
      .limit(1);

    if (!existingBlog.length) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Soft delete the blog
    const deletedBlog = await db
      .update(blogs)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, blogId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully',
      blog: deletedBlog[0],
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
