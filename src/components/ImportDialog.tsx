import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  TextField,
} from '@mui/material';
import { saveBoardData } from '../utils/storage';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    if (!isConfirmed) {
      setError('Please confirm that you understand this will erase all existing data');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validate the data structure
          if (!data.holdingArea || !data.boardCells || !data.numberOfYears || !data.visibleYears) {
            throw new Error('Invalid data format');
          }

          // Save the imported data
          await saveBoardData(
            data.holdingArea,
            data.boardCells,
            data.numberOfYears,
            data.visibleYears
          );

          // Close the dialog and refresh the page
          onClose();
          window.location.reload();
        } catch (err) {
          setError('Failed to parse the file. Please make sure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to import data: ' + (err as Error).message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Data</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Alert severity="warning">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Warning: Importing data will erase all existing data!
            </Typography>
            <Typography variant="body2">
              Make sure you have exported your current data before proceeding.
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2">
                Selected file: {file.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="checkbox"
              id="confirm-import"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <label htmlFor="confirm-import">
              I understand that this will erase all existing data
            </label>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="primary"
          disabled={!file || !isConfirmed}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog; 