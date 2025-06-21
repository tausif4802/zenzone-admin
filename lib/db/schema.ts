import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// Define user role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Define user status enum
export const userStatusEnum = pgEnum('user_status', ['regular', 'premium']);

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  status: userStatusEnum('status').default('regular').notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  lastWatched: timestamp('last_watched', { withTimezone: true }),
  lastRead: timestamp('last_read', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Blogs table schema
export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  body: text('body').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Breathing Guides table schema
export const breathingGuides = pgTable('breathing_guides', {
  id: serial('id').primaryKey(),
  serial: integer('serial').notNull().unique(), // Unique serial number
  title: varchar('title', { length: 255 }).notNull(),
  guide: text('guide').notNull(), // Instructions/guide text
  description: text('description').notNull(),
  audioUrl: varchar('audio_url', { length: 500 }),
  duration: integer('duration'), // Duration in seconds
  isFeatured: boolean('is_featured').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Type inference for users
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = 'admin' | 'user';
export type UserStatus = 'regular' | 'premium';

// Type inference for blogs
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;

// Type inference for breathing guides
export type BreathingGuide = typeof breathingGuides.$inferSelect;
export type NewBreathingGuide = typeof breathingGuides.$inferInsert;
