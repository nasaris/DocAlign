import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  originalFilename: string;
  status: 'UPLOADED' | 'READY' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentParagraph {
  id: string;
  documentId: string;
  index: number;
  paragraphId: string;
  text: string;
  html?: string;
}

export interface Inconsistency {
  id: string;
  projectId: string;
  sourceDocumentId: string;
  targetDocumentId: string;
  inconsistencyType: 'CONTRADICTION' | 'MISSING_REQUIREMENT' | 'CONFLICTING_DEFINITION' | 'INCONSISTENT_SCOPE' | 'DATA_MISMATCH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  explanation: string;
  recommendation: string;
  sourceExcerpt: string;
  targetExcerpt: string;
  sourceParagraphIndex: number;
  sourceStartOffset: number;
  sourceEndOffset: number;
  targetParagraphIndex: number;
  targetStartOffset: number;
  targetEndOffset: number;
  createdAt: string;
  sourceDocument?: { id: string; title: string };
  targetDocument?: { id: string; title: string };
}

// API Functions

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data.projects;
};

export const createProject = async (name: string): Promise<Project> => {
  const response = await api.post('/projects', { name });
  return response.data.project;
};

// Documents
export const getProjectDocuments = async (projectId: string): Promise<Document[]> => {
  const response = await api.get(`/projects/${projectId}/documents`);
  return response.data.documents;
};

export const uploadDocument = async (
  projectId: string,
  file: File
): Promise<{ documentId: string; title: string; paragraphsCount: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/projects/${projectId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.document;
};

export const getDocumentContent = async (
  documentId: string
): Promise<{ document: Document; paragraphs: DocumentParagraph[] }> => {
  const response = await api.get(`/documents/${documentId}/content`);
  return response.data;
};

// Consistency Analysis
export const runConsistencyCheck = async (
  projectId: string
): Promise<{ success: boolean; message: string; pairsAnalyzed: number; inconsistenciesFound: number }> => {
  const response = await api.post(`/projects/${projectId}/consistency/run`);
  return response.data;
};

export const getInconsistencies = async (
  projectId: string,
  documentId?: string
): Promise<Inconsistency[]> => {
  const params = documentId ? { documentId } : {};
  const response = await api.get(`/projects/${projectId}/inconsistencies`, { params });
  return response.data.inconsistencies;
};
