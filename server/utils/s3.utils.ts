import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream, unlinkSync } from 'fs';
import { DELIVERY_PARTNER_S3_CONFIG } from '../constants';

// Use existing S3 client from config
import { s3Client } from '../config/s3';

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;

/**
 * Unified upload configuration for different file types and contexts
 */
export interface UploadOptions {
  /** The file to upload */
  file: Express.Multer.File;
  /** Upload context (products, users, categories, reviews, etc.) */
  folder: string;
  /** Optional user/entity ID for organizing files */
  entityId?: number | string;
  /** Optional subfolder within the main folder */
  subfolder?: string;
  /** Allowed MIME types (defaults to all if not specified) */
  allowedMimeTypes?: string[];
  /** Max file size in bytes (defaults to 10MB) */
  maxFileSize?: number;
}

/**
 * Upload path generators for proper folder structure
 * Root structure: admin/, buyer/, seller/, deliveryPartner/, public/
 */
export const UPLOAD_PATHS = {
  // Public uploads (accessible to all)
  BANNER: () => 'public/banners',
  PROMOTION: () => 'public/promotions',
  CATEGORY_ICONS: () => 'public/categories/icons',
  SUBCATEGORY_IMAGES: () => 'public/categories/subcategories',

  // Admin uploads
  ADMIN_PROFILE: (userId: number) => `admin/user-${userId}/profile`,
  ADMIN_DOCUMENTS: (userId: number) => `admin/user-${userId}/documents`,

  // Seller uploads
  SELLER_PROFILE: (userId: number) => `seller/user-${userId}/profile`,
  SELLER_DOCUMENTS: (userId: number) => `seller/user-${userId}/documents`,
  SELLER_PRODUCT_IMAGES: (userId: number, productId: number) =>
    `seller/user-${userId}/products/product-${productId}/images`,
  SELLER_PRODUCT_VIDEOS: (userId: number, productId: number) =>
    `seller/user-${userId}/products/product-${productId}/videos`,

  // Buyer uploads
  BUYER_PROFILE: (userId: number) => `buyer/user-${userId}/profile`,
  BUYER_REVIEW_IMAGES: (userId: number, productId: number) =>
    `buyer/user-${userId}/products/product-${productId}/reviews`,

  // Delivery Partner uploads
  DELIVERY_PARTNER_PROFILE: (userId: number) => `deliveryPartner/user-${userId}/profile`,
  DELIVERY_PARTNER_DOCUMENTS: (userId: number) =>
    `deliveryPartner/user-${userId}/delivery-partner-documents`,
  DELIVERY_PARTNER_VEHICLE_DOCUMENTS: (userId: number) =>
    `deliveryPartner/user-${userId}/vehicle-documents`,
} as const;

/**
 * Common folder paths for file uploads (deprecated - use UPLOAD_PATHS instead)
 * @deprecated Use UPLOAD_PATHS for proper folder structure
 */
export const UPLOAD_FOLDERS = {
  PRODUCTS: 'products',
  PRODUCT_IMAGES: 'products/images',
  PRODUCT_VIDEOS: 'products/videos',
  CATEGORIES: 'categories',
  USERS: 'users',
  USER_PROFILES: 'users/profiles',
  REVIEWS: 'reviews',
  REVIEW_IMAGES: 'reviews/images',
  DELIVERY_PARTNERS: 'delivery-partners',
  DELIVERY_DOCUMENTS: 'delivery-partners/documents',
  DELIVERY_VEHICLES: 'delivery-partners/vehicles',
  SELLER_DOCUMENTS: 'sellers/documents',
  SELLER_LOGOS: 'sellers/logos',
  BANNERS: 'banners',
  PROMOTIONS: 'promotions',
} as const;

/**
 * New simplified upload interface using UPLOAD_PATHS
 */
export interface SimpleUploadOptions {
  /** The file to upload */
  file: Express.Multer.File;
  /** Upload path from UPLOAD_PATHS */
  uploadPath: string;
  /** Allowed MIME types (defaults to all if not specified) */
  allowedMimeTypes?: string[];
  /** Max file size in bytes (defaults to 10MB) */
  maxFileSize?: number;
}

/**
 * Simplified upload function using the new UPLOAD_PATHS structure
 * This is the recommended way to upload files with proper folder organization
 *
 * @example
 * // Upload seller product image
 * const url = await uploadWithPath({
 *   file: req.file,
 *   uploadPath: UPLOAD_PATHS.SELLER_PRODUCT_IMAGES(sellerId, productId),
 *   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
 * });
 *
 * @example
 * // Upload buyer review image
 * const url = await uploadWithPath({
 *   file: req.file,
 *   uploadPath: UPLOAD_PATHS.BUYER_REVIEW_IMAGES(buyerId, productId),
 *   allowedMimeTypes: ['image/jpeg', 'image/png'],
 * });
 */
export async function uploadWithPath(options: SimpleUploadOptions): Promise<string> {
  const {
    file,
    uploadPath,
    allowedMimeTypes,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type if specified
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${maxFileSize / 1024 / 1024}MB`);
    }

    // Clean the filename
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Create unique file key with the provided path
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const key = `${uploadPath}/${timestamp}-${uuid}-${sanitizedFileName}`;

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

    // Auto-detect content type
    const contentType = file.mimetype || getContentType(file.originalname);

    // Upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      Metadata: {
        'original-filename': sanitizedFileName,
        'upload-timestamp': timestamp.toString(),
        'upload-path': uploadPath,
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
 * Upload multiple files using the new UPLOAD_PATHS structure
 */
export async function uploadMultipleWithPath(
  options: Omit<SimpleUploadOptions, 'file'> & { files: Express.Multer.File[] }
): Promise<string[]> {
  try {
    const { files, ...restOptions } = options;
    const uploadPromises = files.map((file) => uploadWithPath({ file, ...restOptions }));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to S3:', error);
    throw new Error(
      `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Common folder paths for file uploads (deprecated - use UPLOAD_PATHS instead)
 * @deprecated Use UPLOAD_PATHS for proper folder structure
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const contentTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Unified upload function - handles all types of file uploads with proper path management
 * Use this instead of separate upload functions for different file types
 *
 * @example
 * // Upload product image
 * const url = await uploadFile({
 *   file: req.file,
 *   folder: UPLOAD_FOLDERS.PRODUCT_IMAGES,
 *   entityId: productId,
 * });
 *
 * @example
 * // Upload user profile picture
 * const url = await uploadFile({
 *   file: req.file,
 *   folder: UPLOAD_FOLDERS.USER_PROFILES,
 *   entityId: userId,
 *   allowedMimeTypes: ['image/jpeg', 'image/png'],
 * });
 */
export async function uploadFile(options: UploadOptions): Promise<string> {
  const {
    file,
    folder,
    entityId,
    subfolder,
    allowedMimeTypes,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type if specified
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${maxFileSize / 1024 / 1024}MB`);
    }

    // Clean the filename
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Create unique file key with organized path structure
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const entityPrefix = entityId ? `${entityId}/` : '';
    const subfolderPath = subfolder ? `${subfolder}/` : '';
    const key = `${folder}/${entityPrefix}${subfolderPath}${timestamp}-${uuid}-${sanitizedFileName}`;

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

    // Auto-detect content type
    const contentType = file.mimetype || getContentType(file.originalname);

    // Upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      Metadata: {
        'original-filename': sanitizedFileName,
        'upload-timestamp': timestamp.toString(),
        ...(entityId && { 'entity-id': entityId.toString() }),
        folder: folder,
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
 * Upload multiple files to S3
 * @example
 * const urls = await uploadMultipleFiles({
 *   files: req.files,
 *   folder: UPLOAD_FOLDERS.REVIEW_IMAGES,
 *   entityId: reviewId,
 * });
 */
export async function uploadMultipleFiles(
  options: Omit<UploadOptions, 'file'> & { files: Express.Multer.File[] }
): Promise<string[]> {
  try {
    const { files, ...restOptions } = options;
    const uploadPromises = files.map((file) => uploadFile({ file, ...restOptions }));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to S3:', error);
    throw new Error(
      `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Legacy function - kept for backward compatibility with delivery partner uploads
 * Consider using uploadFile() with UPLOAD_FOLDERS.DELIVERY_DOCUMENTS instead
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
 * Delete a file from S3 using its URL or key
 * @param fileUrlOrKey - Full S3 URL or just the key of the file to delete
 */
export async function deleteFile(fileUrlOrKey: string): Promise<void> {
  try {
    if (!fileUrlOrKey) {
      throw new Error('No file URL or key provided');
    }

    let key: string;

    // Check if it's a URL or just a key
    if (fileUrlOrKey.includes('amazonaws.com/')) {
      // Extract the key from the URL
      // URL format: https://bucket-name.s3.region.amazonaws.com/key
      const urlParts = fileUrlOrKey.split('.amazonaws.com/');
      if (urlParts.length < 2) {
        throw new Error('Invalid S3 URL format');
      }
      key = urlParts[1];
    } else {
      // It's already a key
      key = fileUrlOrKey;
    }

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
 * Legacy function - kept for backward compatibility
 * Consider using deleteFile() instead
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  return deleteFile(fileUrl);
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
 * @param fileUrlsOrKeys - Array of S3 URLs or keys to delete
 */
export async function deleteMultipleFiles(fileUrlsOrKeys: string[]): Promise<void> {
  try {
    const deletePromises = fileUrlsOrKeys
      .filter((url) => url) // Filter out null/undefined URLs
      .map((url) => deleteFile(url));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error);
    throw new Error(
      `Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Legacy function - kept for backward compatibility
 * Consider using deleteMultipleFiles() instead
 */
export async function deleteMultipleFromS3(fileUrls: string[]): Promise<void> {
  return deleteMultipleFiles(fileUrls);
}
