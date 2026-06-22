/**
 * Uploads the login page background image to Firebase Storage.
 * Prefers public/images/lab-background.jpg, falls back to lab-login-bg.svg.
 *
 * Usage: npm run seed-login-bg
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const STORAGE_PATH_PREFIX = 'lims/assets/login-background';

function loadEnvLocal() {
  const envPath = resolve(root, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function resolveStorageBucketName(projectId) {
  return process.env.FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`;
}

function initFirebase() {
  const credPath = process.env.FIREBASE_CREDENTIALS;
  if (!credPath) {
    throw new Error('FIREBASE_CREDENTIALS is not set in .env.local');
  }
  const resolved = resolve(root, credPath);
  const serviceAccount = JSON.parse(readFileSync(resolved, 'utf8'));
  const bucketName = resolveStorageBucketName(serviceAccount.project_id);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName,
  });
  return { projectId: serviceAccount.project_id, bucketName };
}

function resolveSourceFile() {
  const jpg = resolve(root, 'public/images/lab-background.jpg');
  if (existsSync(jpg)) {
    return { path: jpg, ext: 'jpg', contentType: 'image/jpeg' };
  }
  const svg = resolve(root, 'public/images/lab-login-bg.svg');
  if (existsSync(svg)) {
    return { path: svg, ext: 'svg', contentType: 'image/svg+xml' };
  }
  throw new Error('No login image found. Add public/images/lab-background.jpg or lab-login-bg.svg');
}

async function main() {
  loadEnvLocal();
  const { bucketName } = initFirebase();
  const { path, ext, contentType } = resolveSourceFile();
  const destination = `${STORAGE_PATH_PREFIX}.${ext}`;
  const bucket = admin.storage().bucket(bucketName);

  console.log(`Uploading ${path}`);
  console.log(`  → gs://${bucketName}/${destination}`);

  try {
    await bucket.upload(path, {
      destination,
      metadata: {
        contentType,
        cacheControl: 'public, max-age=3600',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('does not exist') || msg.includes('notFound')) {
      console.error(
        '\nFirebase Storage bucket not found. In Firebase Console:\n' +
          '  1. Open Storage → Get started (create a bucket)\n' +
          '  2. Copy the bucket name (e.g. your-project.firebasestorage.app)\n' +
          '  3. Add to .env.local: FIREBASE_STORAGE_BUCKET=your-bucket-name\n' +
          '  4. Run npm run seed-login-bg again\n',
      );
    }
    throw err;
  }

  const [signedUrl] = await bucket.file(destination).getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  });

  console.log('Done. Login background is in Firebase Storage.');
  console.log(`Signed URL (1h): ${signedUrl}`);
  console.log('The login page loads this via GET /api/auth/login-background');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
