import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { logActivity } from '../utils/dbHelpers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}

router.post('/signup', async (req, res) => {
  try {
    console.log('[auth] signup body:', req.body);
    const { name, email, phone, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at, last_login`,
      [name.trim(), email.toLowerCase().trim(), phone?.trim() || null, hash]
    );

    const user = result.rows[0];
    const token = signToken(user.id);

    await logActivity(user.id, 'signup', { email: user.email });

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('[auth] login body:', req.body);
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const updated = await query(
      'SELECT id, name, email, phone, created_at, last_login FROM users WHERE id = $1',
      [user.id]
    );

    const safeUser = updated.rows[0];
    const token = signToken(safeUser.id);

    await logActivity(safeUser.id, 'login');

    res.json({ token, user: sanitizeUser(safeUser) });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await logActivity(req.user.userId, 'logout');
    res.clearCookie('cabrush_token');
    res.json({ success: true });
  } catch (err) {
    console.error('[auth] logout error:', err.message);
    res.status(500).json({ message: 'Logout failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, phone FROM users WHERE id = $1', [
      req.user.userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    console.error('[auth] me error:', err);
    res.status(500).json({ message: 'Failed to load user' });
  }
});

export default router;
