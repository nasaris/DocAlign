import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';

export async function getDocumentContent(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      paragraphs: {
        orderBy: { index: 'asc' }
      }
    }
  });

  if (!document) {
    throw new AppError(404, 'Document not found');
  }

  return {
    document: {
      id: document.id,
      title: document.title,
      status: document.status
    },
    paragraphs: document.paragraphs
  };
}
