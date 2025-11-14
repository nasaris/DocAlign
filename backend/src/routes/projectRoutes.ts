import { Router } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import {
  getAllProjects,
  createProject,
  getProjectDocuments
} from '../services/projectService';

const router = Router();

// GET /projects - List all projects
router.get('/', asyncHandler(async (req, res) => {
  const projects = await getAllProjects();
  res.json({ projects });
}));

// POST /projects - Create new project
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const project = await createProject(name.trim());
  res.status(201).json({ project });
}));

// GET /projects/:projectId/documents - Get all documents in a project
router.get('/:projectId/documents', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const documents = await getProjectDocuments(projectId);
  res.json({ documents });
}));

export default router;
