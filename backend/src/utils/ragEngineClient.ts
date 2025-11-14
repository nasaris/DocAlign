import axios, { AxiosInstance } from 'axios';
import { logger } from './logger';
import { AppError } from './errorHandler';

class RAGEngineClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.RAG_ENGINE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL,
      timeout: 300000, // 5 minutes for long-running operations
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info(`RAG Engine client initialized with base URL: ${baseURL}`);
  }

  async ingestDocument(projectId: string, documentId: string): Promise<void> {
    try {
      logger.info(`Ingesting document ${documentId} for project ${projectId}`);
      await this.client.post('/embeddings/ingest-document', {
        project_id: projectId,
        document_id: documentId
      });
      logger.info(`Document ${documentId} ingested successfully`);
    } catch (error: any) {
      logger.error(`Failed to ingest document ${documentId}:`, error.message);
      throw new AppError(
        500,
        `Failed to ingest document: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async analyzePair(
    projectId: string,
    doc1Id: string,
    doc2Id: string
  ): Promise<Inconsistency[]> {
    try {
      logger.info(`Analyzing document pair: ${doc1Id} <-> ${doc2Id}`);
      const response = await this.client.post('/consistency/analyze-pair', {
        project_id: projectId,
        doc1_id: doc1Id,
        doc2_id: doc2Id
      });
      logger.info(`Found ${response.data.inconsistencies?.length || 0} inconsistencies`);
      return response.data.inconsistencies || [];
    } catch (error: any) {
      logger.error(`Failed to analyze document pair:`, error.message);
      throw new AppError(
        500,
        `Failed to analyze document pair: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

export interface Inconsistency {
  source_document_id: string;
  target_document_id: string;
  source_paragraph_id: string;
  target_paragraph_id: string;
  source_excerpt: string;
  target_excerpt: string;
  source_location: {
    paragraph_id: string;
    start_offset: number;
    end_offset: number;
  };
  target_location: {
    paragraph_id: string;
    start_offset: number;
    end_offset: number;
  };
  inconsistency_type: 'CONTRADICTION' | 'MISSING_REQUIREMENT' | 'CONFLICTING_DEFINITION' | 'INCONSISTENT_SCOPE' | 'DATA_MISMATCH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  explanation: string;
  recommendation: string;
}

export const ragEngineClient = new RAGEngineClient();
