import { db } from '@/lib/db/index';
import { blogs } from '@/lib/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     tags: [Blogs]
 *     summary: Get all blogs
 *     description: Retrieve all blogs with optional filtering for featured and deleted items, and search functionality
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter for featured blogs
 *       - in: query
 *         name: deleted
 *         schema:
 *           type: boolean
 *         description: Include deleted blogs
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for blogs
 *     responses:
 *       200:
 *         description: List of blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
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

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     tags: [Blogs]
 *     summary: Create a new blog
 *     description: Create a new blog post with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - body
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
 *         description: Blog created successfully
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
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The blog ID
 *         title:
 *           type: string
 *           description: The blog title
 *         description:
 *           type: string
 *           description: Short description of the blog
 *         body:
 *           type: string
 *           description: The main content of the blog
 *         imageUrl:
 *           type: string
 *           description: URL of the blog's featured image
 *         isFeatured:
 *           type: boolean
 *           description: Whether the blog is featured
 *         isDeleted:
 *           type: boolean
 *           description: Whether the blog is deleted
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
