import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useStore } from '../state/useStore';
import { getProjects, createProject, getProjectDocuments } from '../utils/api';
import { UploadZone } from './UploadZone';

export const LeftSidebar = () => {
  const {
    projects,
    selectedProject,
    documents,
    selectedDocument,
    setProjects,
    setSelectedProject,
    setDocuments,
    setSelectedDocument,
  } = useStore();

  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load documents when project changes
  useEffect(() => {
    if (selectedProject) {
      loadDocuments(selectedProject.id);
    } else {
      setDocuments([]);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (projectId: string) => {
    try {
      const docs = await getProjectDocuments(projectId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const project = await createProject(newProjectName);
      setProjects([...projects, project]);
      setSelectedProject(project);
      setNewProjectName('');
      setNewProjectDialogOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDocumentSelect = (doc: typeof documents[0]) => {
    setSelectedDocument(doc);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          DocAlign
        </Typography>

        {/* Project Selector */}
        <Select
          fullWidth
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find((p) => p.id === e.target.value);
            setSelectedProject(project || null);
          }}
          displayEmpty
          size="small"
          sx={{ mb: 1 }}
        >
          <MenuItem value="" disabled>
            Select a project
          </MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>

        {/* New Project Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setNewProjectDialogOpen(true)}
          size="small"
        >
          New Project
        </Button>
      </Box>

      {/* Document List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
          Documents
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ color: '#000' }} />
          </Box>
        ) : documents.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
            No documents yet
          </Typography>
        ) : (
          <List dense>
            {documents.map((doc) => (
              <ListItemButton
                key={doc.id}
                selected={selectedDocument?.id === doc.id}
                onClick={() => handleDocumentSelect(doc)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={doc.title}
                  secondary={doc.status}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    noWrap: true,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* Upload Zone */}
      <Box sx={{ p: 2 }}>
        {selectedProject ? (
          <UploadZone
            projectId={selectedProject.id}
            onUploadSuccess={() => {
              if (selectedProject) {
                loadDocuments(selectedProject.id);
              }
            }}
          />
        ) : (
          <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
            Select a project to upload documents
          </Typography>
        )}
      </Box>

      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onClose={() => setNewProjectDialogOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProject();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
