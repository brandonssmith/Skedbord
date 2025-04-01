import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { ContextMenuProps } from '../types/board';

const colors = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Red', value: '#ffcdd2' },
  { name: 'Blue', value: '#bbdefb' },
  { name: 'Green', value: '#c8e6c9' },
  { name: 'Yellow', value: '#fff9c4' },
  { name: 'Purple', value: '#e1bee7' },
  { name: 'Orange', value: '#ffe0b2' },
  { name: 'Gray', value: '#f5f5f5' },
  { name: 'Pink', value: '#f8bbd0' },
  { name: 'Light Blue', value: '#e3f2fd' },
  { name: 'Teal', value: '#b2dfdb' },
  { name: 'Amber', value: '#fff3e0' },
  { name: 'Deep Purple', value: '#d1c4e9' },
  { name: 'Brown', value: '#d7ccc8' },
  { name: 'Cyan', value: '#e0f7fa' },
  { name: 'Indigo', value: '#c5cae9' },
];

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onClose,
  onLock,
  onUnlock,
  isLocked,
  onColorSelect,
  currentColor,
}) => {
  return (
    <Menu
      open={true}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: position.y,
        left: position.x,
      }}
    >
      {!isLocked ? (
        <MenuItem onClick={onLock}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lock</ListItemText>
        </MenuItem>
      ) : (
        <MenuItem onClick={onUnlock}>
          <ListItemIcon>
            <LockOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Unlock</ListItemText>
        </MenuItem>
      )}
      <MenuItem sx={{ borderTop: '1px solid #e0e0e0', mt: 1 }}>
        <ListItemText primary="Color" />
      </MenuItem>
      {colors.map((color) => (
        <MenuItem
          key={color.value}
          onClick={() => onColorSelect(color.value)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: currentColor === color.value ? '#f5f5f5' : 'transparent',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color.value,
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <ListItemText primary={color.name} />
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ContextMenu; 