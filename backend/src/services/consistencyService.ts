import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { ragEngineClient } from '../utils/ragEngineClient';

export async function runConsistencyCheck(projectId: string) {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      documents: {
        where: { status: 'READY' }
      }
    }
  });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  const readyDocuments = project.documents;

  if (readyDocuments.length < 2) {
    return {
      success: true,
      message: 'Not enough documents to perform consistency check',
      documentsAnalyzed: readyDocuments.length
    };
  }

  logger.info(`Running consistency check for project ${projectId} with ${readyDocuments.length} documents`);

  // Generate all unique document pairs
  const pairs: Array<{ doc1: string; doc2: string }> = [];
  for (let i = 0; i < readyDocuments.length; i++) {
    for (let j = i + 1; j < readyDocuments.length; j++) {
      pairs.push({
        doc1: readyDocuments[i].id,
        doc2: readyDocuments[j].id
      });
    }
  }

  logger.info(`Analyzing ${pairs.length} document pairs`);

  let totalInconsistencies = 0;

  // Analyze each pair
  for (const pair of pairs) {
    const inconsistencies = await ragEngineClient.analyzePair(
      projectId,
      pair.doc1,
      pair.doc2
    );

    // Store inconsistencies in database
    for (const inc of inconsistencies) {
      // Map paragraph_id to paragraph_index
      const sourceParagraph = await prisma.documentParagraph.findFirst({
        where: {
          documentId: inc.source_document_id,
          paragraphId: inc.source_location.paragraph_id
        }
      });

      const targetParagraph = await prisma.documentParagraph.findFirst({
        where: {
          documentId: inc.target_document_id,
          paragraphId: inc.target_location.paragraph_id
        }
      });

      if (!sourceParagraph || !targetParagraph) {
        logger.warn(`Skipping inconsistency: paragraph not found`);
        continue;
      }

      await prisma.documentInconsistency.create({
        data: {
          projectId,
          sourceDocumentId: inc.source_document_id,
          targetDocumentId: inc.target_document_id,
          inconsistencyType: inc.inconsistency_type,
          severity: inc.severity,
          description: inc.description,
          explanation: inc.explanation,
          recommendation: inc.recommendation,
          sourceExcerpt: inc.source_excerpt,
          targetExcerpt: inc.target_excerpt,
          sourceParagraphIndex: sourceParagraph.index,
          sourceStartOffset: inc.source_location.start_offset,
          sourceEndOffset: inc.source_location.end_offset,
          targetParagraphIndex: targetParagraph.index,
          targetStartOffset: inc.target_location.start_offset,
          targetEndOffset: inc.target_location.end_offset
        }
      });

      totalInconsistencies++;
    }
  }

  logger.info(`Consistency check complete. Found ${totalInconsistencies} inconsistencies`);

  return {
    success: true,
    message: `Consistency check complete`,
    pairsAnalyzed: pairs.length,
    inconsistenciesFound: totalInconsistencies
  };
}

export async function getInconsistencies(projectId: string, documentId?: string) {
  const where: any = { projectId };

  if (documentId) {
    where.OR = [
      { sourceDocumentId: documentId },
      { targetDocumentId: documentId }
    ];
  }

  return await prisma.documentInconsistency.findMany({
    where,
    include: {
      sourceDocument: {
        select: { id: true, title: true }
      },
      targetDocument: {
        select: { id: true, title: true }
      }
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}
