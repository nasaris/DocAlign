import { Box } from '@mui/material';
import { LeftSidebar } from './LeftSidebar';
import { DocumentViewer } from './DocumentViewer';
import { RightPanel } from './RightPanel';

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Sidebar - Fixed width */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
        }}
      >
        <LeftSidebar />
      </Box>

      {/* Center - Document Viewer */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#ffffff',
        }}
      >
        <DocumentViewer />
      </Box>

      {/* Right Panel - Inconsistency Details */}
      <Box
        sx={{
          width: 350,
          flexShrink: 0,
          borderLeft: '1px solid #e0e0e0',
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        <RightPanel />
      </Box>
    </Box>
  );
};
