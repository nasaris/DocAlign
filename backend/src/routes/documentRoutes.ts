import { Router } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { getDocumentContent } from '../services/documentService';

const router = Router();

// GET /documents/:documentId/content - Get document paragraphs
router.get('/:documentId/content', asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const content = await getDocumentContent(documentId);
  res.json(content);
}));

export default router;
