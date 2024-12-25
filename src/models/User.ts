import { pool } from '../index';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  email: string;
  password: string;
  avatar?: string;
}

// метод для создания пользователя
export async function createUser(user: User) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password, avatar) VALUES ($1, $2, $3) RETURNING *',
    [user.email, hashedPassword, user.avatar]
  );
  return result.rows[0];
}

// медот обновления пользователя
export async function editUser(user: User) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const result = await pool.query(
    'UPDATE users SET email = $1, password = $2, avatar = $3 WHERE id = $4 RETURNING *',
    [user.email, hashedPassword, user.avatar, user.id]
  );
  return result.rows[0];
}

// метод для поиска пользователя по email
export async function findByEmail(email: string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

// метод для поиска пользователя по id
export async function findById(id: number) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

