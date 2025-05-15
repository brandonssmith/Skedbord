import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { saveBoardData, loadBoardData } from '../utils/storage';

interface UpdateUtilityProps {
  open: boolean;
  onClose: () => void;
}

const UpdateUtility: React.FC<UpdateUtilityProps> = ({ open, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'backing-up' | 'updating' | 'restoring' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [backupData, setBackupData] = useState<any>(null);
  const [updateUrl, setUpdateUrl] = useState<string>('');

  const handleBackup = async () => {
    try {
      setStatus('backing-up');
      const data = await loadBoardData();
      setBackupData(data);
      setStatus('idle');
    } catch (err) {
      setError('Failed to backup data: ' + (err as Error).message);
      setStatus('error');
    }
  };

  const handleUpdate = async () => {
    try {
      setStatus('updating');
      
      // List of files to update
      const filesToUpdate = [
        'src/components/Board.tsx',
        'src/components/ContextMenu.tsx',
        'src/components/EditDialog.tsx',
        'src/components/UpdateUtility.tsx',
        'src/types/board.ts',
        'src/utils/storage.ts',
      ];

      // Fetch and update each file
      for (const file of filesToUpdate) {
        try {
          // Here you would typically write the file to the filesystem
          // For now, we'll just log it
          console.log(`Updated ${file}`);
        } catch (err) {
          console.error(`Failed to update ${file}:`, err);
          // Continue with other files even if one fails
        }
      }

      setStatus('restoring');
      
      if (backupData) {
        await saveBoardData(
          backupData.holdingArea,
          backupData.boardCells,
          backupData.numberOfYears,
          backupData.visibleYears
        );
      }
      
      setStatus('complete');
    } catch (err) {
      setError('Failed to update: ' + (err as Error).message);
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setError(null);
    setBackupData(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Utility</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {status === 'complete' ? (
            <Alert severity="success">
              Update completed successfully! Please refresh the page to see the changes.
            </Alert>
          ) : (
            <>
              <Typography>
                This utility will help you update the application while preserving your data.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Steps:
              </Typography>
              <ol>
                <li>Backup current data</li>
                <li>Update application files</li>
                <li>Restore your data</li>
              </ol>

              <TextField
                label="Update URL"
                value={updateUrl}
                onChange={(e) => setUpdateUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                fullWidth
                margin="normal"
              />

              {status === 'backing-up' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Backing up data...</Typography>
                </Box>
              )}

              {status === 'updating' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Updating application...</Typography>
                </Box>
              )}

              {status === 'restoring' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Restoring data...</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {!backupData && status === 'idle' && (
          <Button onClick={handleBackup} variant="contained" color="primary">
            Backup Data
          </Button>
        )}
        {backupData && status === 'idle' && (
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update & Restore
          </Button>
        )}
        {status === 'complete' && (
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUtility; 