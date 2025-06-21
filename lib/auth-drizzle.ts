import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { db } from './db/index';
import { users, type NewUser, type User, type UserRole } from './db/schema';

export type { User, UserRole } from './db/schema';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
  address?: string;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Create user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const passwordHash = await hashPassword(userData.password);

  const newUser: NewUser = {
    email: userData.email,
    passwordHash,
    name: userData.name,
    role: userData.role || 'user',
    phone: userData.phone || null,
    address: userData.address || null,
  };

  const [user] = await db.insert(users).values(newUser).returning();
  return user;
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
};

// Find user by ID
export const findUserById = async (id: number): Promise<User | null> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
};

// Update user's last watched timestamp
export const updateLastWatched = async (userId: number): Promise<void> => {
  await db
    .update(users)
    .set({
      lastWatched: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
};

// Update user's last read timestamp
export const updateLastRead = async (userId: number): Promise<void> => {
  await db
    .update(users)
    .set({
      lastRead: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
};

// Update user profile
export const updateUserProfile = async (
  userId: number,
  updates: Partial<Pick<User, 'name' | 'phone' | 'address'>>
): Promise<User | null> => {
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  return user || null;
};

// Authenticate user
export const authenticateUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return user;
};

// Check if email exists
export const emailExists = async (email: string): Promise<boolean> => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  return !!user;
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  return await db
    .select()
    .from(users)
    .where(eq(users.role, role))
    .orderBy(users.createdAt);
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  return await db.select().from(users).orderBy(users.createdAt);
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: number,
  role: UserRole
): Promise<User | null> => {
  const [user] = await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return user || null;
};

// Get user count
export const getUserCount = async (): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  return result.count;
};

// Get admin count
export const getAdminCount = async (): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'admin'));
  return result.count;
};

// Get regular user count
export const getRegularUserCount = async (): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'user'));
  return result.count;
};
