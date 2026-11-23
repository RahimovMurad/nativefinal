import type { User } from '@/types';
import { getDatabase } from '../database';

type UserRow = {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  avatar_uri: string | null;
  bio: string;
  created_at: string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    avatarUri: row.avatar_uri,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(
  email: string
): Promise<(User & { passwordHash: string }) | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    `SELECT id, full_name, email, password_hash, avatar_uri, bio, created_at
     FROM users
     WHERE LOWER(email) = LOWER(?)`,
    [email.trim()]
  );

  if (!row) return null;
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    `SELECT id, full_name, email, password_hash, avatar_uri, bio, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  return row ? mapUser(row) : null;
}

export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO users (full_name, email, password_hash, avatar_uri, bio, created_at)
     VALUES (?, ?, ?, NULL, ?, ?)`,
    [
      data.fullName.trim(),
      data.email.trim().toLowerCase(),
      data.password,
      'Yeni macəralar planlayan TripMate səyahətçisi.',
      now,
    ]
  );

  const created = await getUserById(res.lastInsertRowId);
  if (!created) {
    throw new Error('İstifadəçi yaradıla bilmədi');
  }
  return created;
}

export async function updateUserProfile(
  id: number,
  data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUri'>>
): Promise<User | null> {
  const db = await getDatabase();
  const existing = await getUserById(id);
  if (!existing) return null;

  await db.runAsync(
    `UPDATE users
     SET full_name = ?, bio = ?, avatar_uri = ?
     WHERE id = ?`,
    [
      data.fullName !== undefined ? data.fullName.trim() : existing.fullName,
      data.bio !== undefined ? data.bio.trim() : existing.bio,
      data.avatarUri !== undefined ? data.avatarUri : existing.avatarUri,
      id,
    ]
  );

  return getUserById(id);
}
