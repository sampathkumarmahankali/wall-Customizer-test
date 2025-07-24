console.log('S3 Bucket:', process.env.AWS_S3_BUCKET_NAME);
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

async function uploadImage(buffer, mimetype) {
  const key = `${uuidv4()}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'private', // Use 'public-read' if you want public access
  };
  console.log('Uploading to S3 with params:', params);
  await s3.upload(params).promise();
  return key; // Store this key in your DB
}

function getPresignedUrl(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 60 * 60, // 1 hour
  };
  return s3.getSignedUrl('getObject', params);
}

async function deleteImage(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  try {
    await s3.deleteObject(params).promise();
    console.log('Deleted S3 object:', key);
  } catch (err) {
    console.error('Failed to delete S3 object:', key, err);
  }
}

module.exports = { uploadImage, getPresignedUrl, deleteImage }; 