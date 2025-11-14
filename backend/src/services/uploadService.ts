import mammoth from 'mammoth';
import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { ragEngineClient } from '../utils/ragEngineClient';

interface ParagraphData {
  index: number;
  paragraphId: string;
  text: string;
  html: string;
}

export async function uploadDocument(
  projectId: string,
  originalFilename: string,
  buffer: Buffer
): Promise<{ documentId: string; title: string; paragraphsCount: number }> {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  // Validate file type
  if (!originalFilename.toLowerCase().endsWith('.docx')) {
    throw new AppError(400, 'Invalid file type. Only .docx files are supported');
  }

  logger.info(`Uploading document: ${originalFilename} to project: ${projectId}`);

  // Create document record with status "uploaded"
  const title = originalFilename.replace(/\.docx$/i, '');
  const document = await prisma.document.create({
    data: {
      projectId,
      title,
      originalFilename,
      status: 'UPLOADED'
    }
  });

  try {
    // Parse .docx file
    const paragraphs = await parseDocxFile(buffer);

    if (paragraphs.length === 0) {
      throw new AppError(400, 'Document contains no paragraphs');
    }

    logger.info(`Extracted ${paragraphs.length} paragraphs from document: ${originalFilename}`);

    // Store paragraphs in database
    await prisma.documentParagraph.createMany({
      data: paragraphs.map((p) => ({
        documentId: document.id,
        index: p.index,
        paragraphId: p.paragraphId,
        text: p.text,
        html: p.html
      }))
    });

    // Update document status to "ready"
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'READY' }
    });

    logger.info(`Document ${document.id} status updated to READY`);

    // Call RAG-engine to ingest embeddings (async, don't wait)
    ragEngineClient
      .ingestDocument(projectId, document.id)
      .then(() => {
        logger.info(`Embeddings ingested successfully for document ${document.id}`);
      })
      .catch((error) => {
        logger.error(`Failed to ingest embeddings for document ${document.id}:`, error);
        // Don't fail the upload, just log the error
      });

    return {
      documentId: document.id,
      title: document.title,
      paragraphsCount: paragraphs.length
    };
  } catch (error: any) {
    // Update document status to "error" if processing fails
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'ERROR' }
    });

    logger.error(`Failed to process document ${document.id}:`, error);
    throw error;
  }
}

async function parseDocxFile(buffer: Buffer): Promise<ParagraphData[]> {
  try {
    // Extract both HTML and plain text
    const result = await mammoth.convert(
      { buffer },
      {
        convertImage: mammoth.images.imgElement(function () {
          return { src: '' }; // Skip images
        })
      }
    );

    const htmlContent = result.value;

    // Also extract plain text
    const textResult = await mammoth.extractRawText({ buffer });
    const plainText = textResult.value;

    // Split into paragraphs (by double newline or HTML paragraph tags)
    const paragraphs = splitIntoParagraphs(plainText, htmlContent);

    return paragraphs;
  } catch (error: any) {
    logger.error('Failed to parse .docx file:', error);
    throw new AppError(400, 'Failed to parse document. File may be corrupted.');
  }
}

function splitIntoParagraphs(plainText: string, htmlContent: string): ParagraphData[] {
  // Split plain text by multiple newlines
  const textParagraphs = plainText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Extract HTML paragraphs (basic extraction)
  const htmlParagraphs = extractHtmlParagraphs(htmlContent);

  const paragraphs: ParagraphData[] = [];
  const maxLength = Math.max(textParagraphs.length, htmlParagraphs.length);

  for (let i = 0; i < maxLength; i++) {
    const text = textParagraphs[i] || '';
    const html = htmlParagraphs[i] || text;

    // Skip empty paragraphs
    if (text.trim().length === 0) continue;

    paragraphs.push({
      index: paragraphs.length,
      paragraphId: `p-${paragraphs.length}`,
      text,
      html
    });
  }

  return paragraphs;
}

function extractHtmlParagraphs(html: string): string[] {
  // Simple HTML paragraph extraction
  // Match content between <p> tags or <h1>-<h6> tags
  const paragraphRegex = /<(p|h[1-6])[^>]*>(.*?)<\/\1>/gi;
  const matches = html.matchAll(paragraphRegex);

  const paragraphs: string[] = [];
  for (const match of matches) {
    const content = match[2].trim();
    if (content.length > 0) {
      paragraphs.push(content);
    }
  }

  // If no paragraphs found, return the entire HTML as one paragraph
  if (paragraphs.length === 0 && html.trim().length > 0) {
    return [html.trim()];
  }

  return paragraphs;
}
