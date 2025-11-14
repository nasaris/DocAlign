import { create } from 'zustand';
import type { Project, Document, DocumentParagraph, Inconsistency } from '../utils/api';

interface AppState {
  // Projects
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;

  // Documents
  documents: Document[];
  selectedDocument: Document | null;
  documentContent: {
    document: Document | null;
    paragraphs: DocumentParagraph[];
  } | null;
  setDocuments: (documents: Document[]) => void;
  setSelectedDocument: (document: Document | null) => void;
  setDocumentContent: (content: { document: Document; paragraphs: DocumentParagraph[] } | null) => void;

  // Inconsistencies
  inconsistencies: Inconsistency[];
  selectedInconsistency: Inconsistency | null;
  setInconsistencies: (inconsistencies: Inconsistency[]) => void;
  setSelectedInconsistency: (inconsistency: Inconsistency | null) => void;

  // UI State
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Projects
  projects: [],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),

  // Documents
  documents: [],
  selectedDocument: null,
  documentContent: null,
  setDocuments: (documents) => set({ documents }),
  setSelectedDocument: (document) => set({ selectedDocument: document }),
  setDocumentContent: (content) => set({ documentContent: content }),

  // Inconsistencies
  inconsistencies: [],
  selectedInconsistency: null,
  setInconsistencies: (inconsistencies) => set({ inconsistencies }),
  setSelectedInconsistency: (inconsistency) => set({ selectedInconsistency: inconsistency }),

  // UI State
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
