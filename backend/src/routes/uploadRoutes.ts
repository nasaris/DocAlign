import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/errorHandler';
import { uploadDocument } from '../services/uploadService';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept .docx files
    if (file.originalname.toLowerCase().endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are allowed'));
    }
  }
});

// POST /projects/:projectId/documents - Upload document
router.post(
  '/:projectId/documents',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadDocument(
      projectId,
      req.file.originalname,
      req.file.buffer
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: result
    });
  })
);

export default router;
