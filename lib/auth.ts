import bcrypt from 'bcryptjs';
import { query } from './db';

export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  last_watched?: Date;
  last_read?: Date;
  created_at: Date;
}

export interface AuthUser extends User {
  password_hash: string;
}

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

  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, phone, address, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
     RETURNING id, email, name, role, phone, address, last_watched, last_read, created_at`,
    [
      userData.email,
      passwordHash,
      userData.name,
      userData.role || 'user',
      userData.phone || null,
      userData.address || null,
    ]
  );

  return result.rows[0];
};

// Find user by email
export const findUserByEmail = async (
  email: string
): Promise<AuthUser | null> => {
  const result = await query(
    `SELECT id, email, name, role, phone, address, password_hash, last_watched, last_read, created_at 
     FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

// Find user by ID (without password hash)
export const findUserById = async (id: number): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, name, role, phone, address, last_watched, last_read, created_at 
     FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

// Update user's last watched timestamp
export const updateLastWatched = async (userId: number): Promise<void> => {
  await query('UPDATE users SET last_watched = NOW() WHERE id = $1', [userId]);
};

// Update user's last read timestamp
export const updateLastRead = async (userId: number): Promise<void> => {
  await query('UPDATE users SET last_read = NOW() WHERE id = $1', [userId]);
};

// Update user profile
export const updateUserProfile = async (
  userId: number,
  updates: Partial<Pick<User, 'name' | 'phone' | 'address'>>
): Promise<User | null> => {
  const setClause = [];
  const values = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClause.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.phone !== undefined) {
    setClause.push(`phone = $${paramIndex++}`);
    values.push(updates.phone);
  }
  if (updates.address !== undefined) {
    setClause.push(`address = $${paramIndex++}`);
    values.push(updates.address);
  }

  if (setClause.length === 0) {
    return findUserById(userId);
  }

  values.push(userId);

  const result = await query(
    `UPDATE users SET ${setClause.join(', ')}, updated_at = NOW() 
     WHERE id = $${paramIndex} 
     RETURNING id, email, name, role, phone, address, last_watched, last_read, created_at`,
    values
  );

  return result.rows[0] || null;
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

  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  // Return user without password hash
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    address: user.address,
    last_watched: user.last_watched,
    last_read: user.last_read,
    created_at: user.created_at,
  };
};

// Check if email exists
export const emailExists = async (email: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM users WHERE email = $1', [email]);

  return result.rows.length > 0;
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const result = await query(
    `SELECT id, email, name, role, phone, address, last_watched, last_read, created_at 
     FROM users WHERE role = $1 ORDER BY created_at DESC`,
    [role]
  );

  return result.rows;
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  const result = await query(
    `SELECT id, email, name, role, phone, address, last_watched, last_read, created_at 
     FROM users ORDER BY created_at DESC`
  );

  return result.rows;
};

// Update user role (admin only)
export const updateUserRole = async (
  userId: number,
  role: UserRole
): Promise<User | null> => {
  const result = await query(
    `UPDATE users SET role = $1, updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, email, name, role, phone, address, last_watched, last_read, created_at`,
    [role, userId]
  );

  return result.rows[0] || null;
};
