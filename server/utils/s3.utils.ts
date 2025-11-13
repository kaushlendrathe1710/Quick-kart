import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream, unlinkSync } from 'fs';
import { DELIVERY_PARTNER_S3_CONFIG } from '../constants';

// Use existing S3 client from config
import { s3Client } from '../config/s3';

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;

/**
 * Upload a file to S3 and return the URL
 * @param file - Express.Multer.File object
 * @param folder - Subfolder in the delivery-partners directory
 * @param userId - Delivery partner user ID for organizing files
 * @returns S3 URL of the uploaded file
 */
export async function uploadToS3(
  file: Express.Multer.File,
  folder: string = DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
  userId?: number
): Promise<string> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = DELIVERY_PARTNER_S3_CONFIG.ALLOWED_MIME_TYPES as readonly string[];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > DELIVERY_PARTNER_S3_CONFIG.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum limit of ${DELIVERY_PARTNER_S3_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Clean the filename
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Create unique file key with user ID for better organization
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const userPrefix = userId ? `user-${userId}/` : '';
    const key = `${DELIVERY_PARTNER_S3_CONFIG.FOLDER_PREFIX}/${userPrefix}${folder}/${timestamp}-${uuid}-${sanitizedFileName}`;

    // Create read stream from the uploaded file
    let fileStream;
    try {
      fileStream = createReadStream(file.path);
    } catch (error) {
      console.error(`Failed to read file at path ${file.path}:`, error);
      throw new Error(
        `Could not read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Error in file stream:', error);
      throw new Error(`Stream error: ${error.message}`);
    });

    // Upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      Metadata: {
        'original-filename': sanitizedFileName,
        'upload-timestamp': timestamp.toString(),
        ...(userId && { 'user-id': userId.toString() }),
      },
    };

    // Create multipart upload
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB parts
      leavePartsOnError: false,
    });

    // Monitor upload progress
    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded}/${progress.total} bytes`);
    });

    // Execute upload
    const result = await upload.done();

    // Construct the URL
    const fileUrl =
      result.Location || `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;

    console.log(`Successfully uploaded to S3: ${fileUrl}`);

    // Clean up local file after successful upload
    try {
      unlinkSync(file.path);
    } catch (error) {
      console.warn(`Failed to delete local file ${file.path}:`, error);
    }

    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);

    // Clean up local file on error
    try {
      if (file?.path) {
        unlinkSync(file.path);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup local file:', cleanupError);
    }

    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a file from S3 using its URL
 * @param fileUrl - Full S3 URL of the file to delete
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl) {
      throw new Error('No file URL provided');
    }

    // Extract the key from the URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL format');
    }

    const key = urlParts[1];

    if (!key) {
      throw new Error('Could not extract key from S3 URL');
    }

    // Create delete command
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Execute delete
    await s3Client.send(deleteCommand);

    console.log(`Successfully deleted file from S3: ${key}`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(
      `Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Upload multiple files to S3
 * @param files - Array of Express.Multer.File objects
 * @param folder - Subfolder in the delivery-partners directory
 * @param userId - Delivery partner user ID
 * @returns Array of S3 URLs
 */
export async function uploadMultipleToS3(
  files: Express.Multer.File[],
  folder: string = DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
  userId?: number
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadToS3(file, folder, userId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to S3:', error);
    throw new Error(
      `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete multiple files from S3
 * @param fileUrls - Array of S3 URLs to delete
 */
export async function deleteMultipleFromS3(fileUrls: string[]): Promise<void> {
  try {
    const deletePromises = fileUrls
      .filter((url) => url) // Filter out null/undefined URLs
      .map((url) => deleteFromS3(url));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error);
    throw new Error(
      `Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
