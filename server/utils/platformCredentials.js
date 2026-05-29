import crypto from 'crypto';
import { query } from '../db/index.js';

const PLATFORMS = ['uber', 'ola', 'rapido'];

function getKey() {
  const secret = process.env.CREDENTIAL_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('CREDENTIAL_SECRET or JWT_SECRET is required');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(value) {
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

function decrypt(value) {
  if (!value) return '';
  const [ivText, tagText, encryptedText] = value.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(ivText, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

function mask(value = '') {
  if (!value) return '';
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 2)}${'*'.repeat(Math.min(value.length - 4, 8))}${value.slice(-2)}`;
}

export function normalizePlatform(platform) {
  const normalized = String(platform || '').toLowerCase();
  if (!PLATFORMS.includes(normalized)) {
    throw new Error('Unsupported platform');
  }
  return normalized;
}

export async function getCredentialStatus(userId) {
  const result = await query(
    `SELECT platform, identifier, secret_encrypted, updated_at
     FROM platform_credentials
     WHERE user_id = $1`,
    [userId]
  );

  const byPlatform = Object.fromEntries(
    PLATFORMS.map((platform) => [
      platform,
      { platform, connected: false, identifier: '', hasSecret: false, updatedAt: null },
    ])
  );

  for (const row of result.rows) {
    byPlatform[row.platform] = {
      platform: row.platform,
      connected: Boolean(row.identifier),
      identifier: mask(row.identifier),
      hasSecret: Boolean(row.secret_encrypted),
      updatedAt: row.updated_at,
    };
  }

  return byPlatform;
}

export async function upsertPlatformCredential(userId, platform, { identifier, secret }) {
  const normalized = normalizePlatform(platform);
  const cleanIdentifier = String(identifier || '').trim();

  if (!cleanIdentifier) {
    throw new Error('Account phone or email is required');
  }

  await query(
    `INSERT INTO platform_credentials (user_id, platform, identifier, secret_encrypted, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, platform)
     DO UPDATE SET
       identifier = EXCLUDED.identifier,
       secret_encrypted = COALESCE(EXCLUDED.secret_encrypted, platform_credentials.secret_encrypted),
       updated_at = NOW()`,
    [userId, normalized, cleanIdentifier, encrypt(secret)]
  );
}

export async function getBookingCredentials(userId) {
  const result = await query(
    `SELECT platform, identifier, secret_encrypted
     FROM platform_credentials
     WHERE user_id = $1`,
    [userId]
  );

  const credentials = {};
  for (const row of result.rows) {
    credentials[row.platform] = {
      identifier: row.identifier,
      secret: decrypt(row.secret_encrypted),
    };
  }

  return credentials;
}

export function missingPlatforms(credentials) {
  return PLATFORMS.filter((platform) => !credentials[platform]?.identifier);
}

export { PLATFORMS };
