import { Router } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { runConsistencyCheck, getInconsistencies } from '../services/consistencyService';

const router = Router();

// POST /projects/:projectId/consistency/run - Run consistency check
router.post('/:projectId/consistency/run', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const result = await runConsistencyCheck(projectId);
  res.json(result);
}));

// GET /projects/:projectId/inconsistencies - Get inconsistencies
router.get('/:projectId/inconsistencies', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { documentId } = req.query;

  const inconsistencies = await getInconsistencies(
    projectId,
    documentId as string | undefined
  );

  res.json({ inconsistencies });
}));

export default router;
