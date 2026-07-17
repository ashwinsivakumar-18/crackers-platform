const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { env } = require('../../config/env');
const { logger } = require('../../lib/logger');

// Local uploads dir (used when S3/MinIO is not configured — e.g. local dev).
const LOCAL_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

let client = null;
function s3() {
  if (!env.s3.accessKey || !env.s3.secretKey) return null;
  if (!client) {
    const { S3Client } = require('@aws-sdk/client-s3');
    client = new S3Client({
      region: env.s3.region,
      endpoint: env.s3.endpoint,
      forcePathStyle: !!env.s3.endpoint,
      credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
    });
  }
  return client;
}

async function putObject(buffer, contentType, prefix = 'uploads') {
  const ext = (contentType.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
  const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const c = s3();
  if (c) {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    await c.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: buffer, ContentType: contentType }));
    return { key, url: `${env.s3.publicUrl}/${key}` };
  }
  // Fallback: write to local disk and serve it via the API at /uploads/<key>.
  const dest = path.join(LOCAL_DIR, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  logger.info('[storage] saved locally', key);
  return { key, url: `${env.apiUrl}/uploads/${key}` };
}
module.exports = { putObject, LOCAL_DIR };
