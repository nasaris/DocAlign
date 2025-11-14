import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

export async function getAllProjects() {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { documents: true, inconsistencies: true }
      }
    }
  });
}

export async function createProject(name: string) {
  logger.info(`Creating new project: ${name}`);
  return await prisma.project.create({
    data: { name }
  });
}

export async function getProjectDocuments(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  return await prisma.document.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });
}
