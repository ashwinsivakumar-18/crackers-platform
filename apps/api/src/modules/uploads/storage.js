const crypto = require('crypto');
const { env } = require('../../config/env');
const { logger } = require('../../lib/logger');

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
  const ext = (contentType.split('/')[1] || 'bin');
  const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const c = s3();
  if (!c) { logger.warn('[storage] S3 not configured — placeholder URL'); return { key, url: `${env.s3.publicUrl}/${key}` }; }
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  await c.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: buffer, ContentType: contentType }));
  return { key, url: `${env.s3.publicUrl}/${key}` };
}
module.exports = { putObject };
