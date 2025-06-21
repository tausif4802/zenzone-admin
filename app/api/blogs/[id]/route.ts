import { db } from '@/lib/db/index';
import { blogs } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     tags: [Blogs]
 *     summary: Get a specific blog
 *     description: Retrieve a blog by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     tags: [Blogs]
 *     summary: Update a blog
 *     description: Update an existing blog by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The blog title
 *               description:
 *                 type: string
 *                 description: Short description of the blog
 *               body:
 *                 type: string
 *                 description: The main content of the blog
 *               imageUrl:
 *                 type: string
 *                 description: URL of the blog's featured image
 *               isFeatured:
 *                 type: boolean
 *                 description: Whether the blog is featured
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid request body or blog ID
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     tags: [Blogs]
 *     summary: Delete a blog
 *     description: Soft delete a blog by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
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
 *                   example: Blog deleted successfully
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
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
