import { Box, Typography, List, ListItemButton, ListItemText, Chip, Divider, Paper } from '@mui/material';
import { useStore } from '../state/useStore';

export const RightPanel = () => {
  const { inconsistencies, selectedInconsistency, setSelectedInconsistency } = useStore();

  const getSeverityColor = (severity: string) => {
    const colors = {
      CRITICAL: 'rgba(0, 0, 0, 0.85)',
      HIGH: 'rgba(0, 0, 0, 0.65)',
      MEDIUM: 'rgba(0, 0, 0, 0.45)',
      LOW: 'rgba(0, 0, 0, 0.25)',
    };
    return colors[severity as keyof typeof colors] || '#000';
  };

  if (inconsistencies.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Inconsistencies
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
          No inconsistencies detected. Run an analysis to check for issues.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h3">Inconsistencies</Typography>
        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
          {inconsistencies.length} found
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {inconsistencies.map((inc) => (
            <ListItemButton
              key={inc.id}
              selected={selectedInconsistency?.id === inc.id}
              onClick={() => setSelectedInconsistency(inc)}
              sx={{
                borderBottom: '1px solid #f0f0f0',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Chip
                      label={inc.severity}
                      size="small"
                      sx={{
                        backgroundColor: getSeverityColor(inc.severity),
                        color: inc.severity === 'LOW' ? '#000' : '#fff',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                    <Chip
                      label={inc.inconsistencyType}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20, borderColor: '#999', color: '#666' }}
                    />
                  </Box>
                }
                secondary={inc.description}
                secondaryTypographyProps={{
                  sx: { fontSize: '0.875rem', color: '#333' },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {selectedInconsistency && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderTop: '2px solid #000',
            maxHeight: '40%',
            overflow: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Explanation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#333' }}>
            {selectedInconsistency.explanation}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Recommendation
          </Typography>
          <Typography variant="body2" sx={{ color: '#333' }}>
            {selectedInconsistency.recommendation}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
