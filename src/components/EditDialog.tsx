import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ChromePicker } from 'react-color';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string, fontFamily: string, textColor: string) => void;
  initialContent: string;
  initialFontFamily?: string;
  initialTextColor?: string;
}

const fontOptions = [
  // Sans-serif fonts
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Candara', value: 'Candara, sans-serif' },
  { label: 'Century Gothic', value: '"Century Gothic", sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", sans-serif' },
  { label: 'Consolas', value: 'Consolas, sans-serif' },
  { label: 'Corbel', value: 'Corbel, sans-serif' },
  { label: 'Franklin Gothic', value: '"Franklin Gothic", sans-serif' },
  { label: 'Gill Sans', value: '"Gill Sans", sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Lucida Console', value: '"Lucida Console", sans-serif' },
  { label: 'Lucida Sans Unicode', value: '"Lucida Sans Unicode", sans-serif' },
  { label: 'MS Gothic', value: '"MS Gothic", sans-serif' },
  { label: 'MS PGothic', value: '"MS PGothic", sans-serif' },
  { label: 'MS UI Gothic', value: '"MS UI Gothic", sans-serif' },
  { label: 'Palatino Linotype', value: '"Palatino Linotype", sans-serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  
  // Serif fonts
  { label: 'Book Antiqua', value: '"Book Antiqua", serif' },
  { label: 'Bookman Old Style', value: '"Bookman Old Style", serif' },
  { label: 'Cambria', value: 'Cambria, serif' },
  { label: 'Courier New', value: '"Courier New", serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'MS Mincho', value: '"MS Mincho", serif' },
  { label: 'MS PMincho', value: '"MS PMincho", serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  
  // Monospace fonts
  { label: 'Courier', value: 'Courier, monospace' },
  { label: 'Lucida Sans Typewriter', value: '"Lucida Sans Typewriter", monospace' },
  { label: 'Monaco', value: 'Monaco, monospace' },
  
  // Cursive fonts
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Monotype Corsiva', value: '"Monotype Corsiva", cursive' },
  
  // Fantasy fonts
  { label: 'Copperplate', value: 'Copperplate, fantasy' },
  { label: 'Papyrus', value: 'Papyrus, fantasy' },
];

const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onClose,
  onSave,
  initialContent,
  initialFontFamily = 'Arial, sans-serif',
  initialTextColor = '#000000',
}) => {
  const [content, setContent] = useState(initialContent);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [textColor, setTextColor] = useState(initialTextColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSave = () => {
    onSave(content, fontFamily, textColor);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Cell Content</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Font</InputLabel>
            <Select
              value={fontFamily}
              label="Font"
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {fontOptions.map((font) => (
                <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
                  {font.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Button
              variant="outlined"
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{ mb: 1 }}
            >
              {showColorPicker ? 'Hide Color Picker' : 'Show Color Picker'}
            </Button>
            {showColorPicker && (
              <Box 
                sx={{ mt: 1 }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <ChromePicker
                  color={textColor}
                  onChange={(color) => setTextColor(color.hex)}
                  disableAlpha
                />
              </Box>
            )}
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: fontFamily,
                color: textColor,
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog; 