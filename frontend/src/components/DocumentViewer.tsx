import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useStore } from '../state/useStore';
import { getDocumentContent, getInconsistencies, runConsistencyCheck } from '../utils/api';
import { highlightStyles } from '../theme/monochromeTheme';

export const DocumentViewer = () => {
  const {
    selectedProject,
    selectedDocument,
    documentContent,
    inconsistencies,
    selectedInconsistency,
    setDocumentContent,
    setInconsistencies,
    setSelectedInconsistency,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (selectedDocument) {
      loadDocument();
      loadInconsistencies();
    } else {
      setDocumentContent(null);
    }
  }, [selectedDocument]);

  const loadDocument = async () => {
    if (!selectedDocument) return;
    try {
      setLoading(true);
      const content = await getDocumentContent(selectedDocument.id);
      setDocumentContent(content);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInconsistencies = async () => {
    if (!selectedProject || !selectedDocument) return;
    try {
      const data = await getInconsistencies(selectedProject.id, selectedDocument.id);
      setInconsistencies(data);
    } catch (error) {
      console.error('Failed to load inconsistencies:', error);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedProject) return;
    try {
      setAnalyzing(true);
      await runConsistencyCheck(selectedProject.id);
      await loadInconsistencies();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderParagraphWithHighlights = (paragraph: any) => {
    const relevantInconsistencies = inconsistencies.filter(
      (inc) =>
        inc.sourceDocumentId === selectedDocument?.id && inc.sourceParagraphIndex === paragraph.index
    );

    if (relevantInconsistencies.length === 0) {
      return <Typography component="p" sx={{ mb: 2 }}>{paragraph.text}</Typography>;
    }

    // Simple rendering with highlights
    return (
      <Typography component="p" sx={{ mb: 2 }}>
        {relevantInconsistencies.map((inc, idx) => (
          <Box
            key={idx}
            component="span"
            onClick={() => setSelectedInconsistency(inc)}
            sx={{
              ...highlightStyles[inc.severity.toLowerCase() as keyof typeof highlightStyles],
              ...(selectedInconsistency?.id === inc.id ? highlightStyles.selected : {}),
            }}
          >
            {inc.sourceExcerpt}
          </Box>
        ))}
        {paragraph.text}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: '#000' }} />
      </Box>
    );
  }

  if (!selectedDocument) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, color: '#999' }}>
          No document selected
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Select a document from the sidebar or upload a new one
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{documentContent?.document.title}</Typography>
        <Button
          variant="contained"
          startIcon={analyzing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlayArrowIcon />}
          onClick={handleRunAnalysis}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </Box>

      {documentContent?.paragraphs.map((paragraph) => (
        <Box key={paragraph.id}>{renderParagraphWithHighlights(paragraph)}</Box>
      ))}
    </Box>
  );
};
