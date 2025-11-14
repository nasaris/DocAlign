import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { uploadDocument } from '../utils/api';

interface UploadZoneProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export const UploadZone = ({ projectId, onUploadSuccess }: UploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.docx')) {
        setSnackbar({
          open: true,
          message: 'Only .docx files are supported',
          severity: 'error',
        });
        return;
      }

      try {
        setUploading(true);
        const result = await uploadDocument(projectId, file);
        setSnackbar({
          open: true,
          message: `Document "${result.title}" uploaded successfully (${result.paragraphsCount} paragraphs)`,
          severity: 'success',
        });
        onUploadSuccess();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.response?.data?.error || 'Upload failed',
          severity: 'error',
        });
      } finally {
        setUploading(false);
      }
    },
    [projectId, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <>
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? '#000' : '#e0e0e0',
          backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: uploading ? '#e0e0e0' : '#666',
            backgroundColor: uploading ? 'transparent' : 'rgba(0, 0, 0, 0.01)',
          },
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <Box>
            <CircularProgress size={32} sx={{ color: '#000', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Uploading...
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#000', mb: 0.5 }}>
              {isDragActive ? 'Drop the file here' : 'Drag & drop .docx file here'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              or click to select
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
