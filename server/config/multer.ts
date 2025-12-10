import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { PRODUCT_MEDIA_CONFIG } from '../constants';

// Configure multer for product image uploads
export const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'products', 'images');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'product-img-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILE_SIZE,
    files: PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = PRODUCT_MEDIA_CONFIG.IMAGE.ALLOWED_MIME_TYPES as readonly string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

// Configure multer for product video uploads
export const productVideoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'products', 'videos');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'product-video-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: PRODUCT_MEDIA_CONFIG.VIDEO.MAX_FILE_SIZE,
    files: PRODUCT_MEDIA_CONFIG.VIDEO.MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = PRODUCT_MEDIA_CONFIG.VIDEO.ALLOWED_MIME_TYPES as readonly string[];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  },
});

// Configure multer for video uploads
export const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Configure multer for thumbnail uploads
export const thumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads', 'thumbnails'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for thumbnails
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Configure multer for profile image uploads (avatar and channel banner)
export const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads', 'profile'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for profile images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Configure multer for store branding images (logo and banner)
export const storeImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'store');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'store-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for store images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure multer for delivery partner documents
export const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'documents');

      // Ensure the directory exists
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'document-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  },
});

// Configure multer for banner/promotional image uploads
export const bannerImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'banners');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for banners (higher quality)
    files: 1, // One banner at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: JPG, PNG, WEBP'));
    }
  },
});

// Configure multer for category icon uploads
// Small square icons for category display (recommended: 1:1 aspect ratio, max 500KB)
export const categoryIconUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'categories', 'icons');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'category-icon-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 500 * 1024, // 500KB limit for small icons
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: JPG, PNG, WEBP, SVG'));
    }
  },
});

// Configure multer for subcategory image uploads
// Small images for subcategory display (recommended: 1:1 aspect ratio, max 1MB)
export const subcategoryImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'categories', 'subcategories');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'subcategory-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit for subcategory images
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: JPG, PNG, WEBP'));
    }
  },
});

// Configure multer for seller document uploads
export const sellerDocumentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'seller', 'documents');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'document-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for documents
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, JPG, PNG'));
    }
  },
});

// Raw body middleware for chunked uploads
export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['content-type'] === 'application/octet-stream') {
    let data = Buffer.alloc(0);
    req.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  } else {
    next();
  }
};
