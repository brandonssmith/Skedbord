export interface Theater {
  name: string;
  screens: number;
}

export interface Cell {
  id: string;
  content: string;
  isLocked: boolean;
  color?: string;
  fontFamily?: string;
  textColor?: string;
}

export interface BoardCell {
  cell: Cell | null;
  theaterIndex: number;
  dateIndex: number;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  position: ContextMenuPosition;
  onClose: () => void;
  onLock: () => void;
  onUnlock: () => void;
  isLocked: boolean;
  onColorSelect: (color: string) => void;
  currentColor?: string;
} 