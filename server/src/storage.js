import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/board.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
fs.ensureDirSync(dataDir);

// Initialize empty board if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeJsonSync(DATA_FILE, {
    holdingArea: [],
    boardCells: [],
    numberOfYears: 1,
    visibleYears: [0],
    lastUpdated: new Date().toISOString()
  });
}

export const loadBoard = () => {
  try {
    const data = fs.readJsonSync(DATA_FILE);
    return {
      holdingArea: data.holdingArea || [],
      boardCells: data.boardCells || [],
      numberOfYears: data.numberOfYears || 1,
      visibleYears: data.visibleYears || [0],
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading board:', error);
    return {
      holdingArea: [],
      boardCells: [],
      numberOfYears: 1,
      visibleYears: [0],
      lastUpdated: new Date().toISOString()
    };
  }
};

export const saveBoard = (data) => {
  try {
    fs.writeJsonSync(DATA_FILE, {
      holdingArea: data.holdingArea || [],
      boardCells: data.boardCells || [],
      numberOfYears: data.numberOfYears || 1,
      visibleYears: data.visibleYears || [0],
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving board:', error);
    return false;
  }
};

export const renameColumns = (newColumnNames) => {
  try {
    const board = loadBoard();
    const boardCells = board.boardCells;
    
    // Create a new board structure with reordered columns
    const newBoardCells = boardCells.map((row, rowIndex) => {
      // Create a new row with the same length as the new column names
      const newRow = new Array(newColumnNames.length).fill(null);
      
      // Only process the first row (column headers)
      if (rowIndex === 0) {
        // Create new header cells with the provided names
        newColumnNames.forEach((name, index) => {
          newRow[index] = {
            cell: {
              id: `header-${index}`,
              content: name,
              isLocked: true,
              color: "#ffffff"
            },
            theaterIndex: index,
            dateIndex: 0
          };
        });
      } else {
        // For other rows, maintain the existing data structure
        row.forEach((cell, index) => {
          if (index < newColumnNames.length) {
            if (cell && cell.cell) {
              // Copy existing cell data
              newRow[index] = {
                cell: {
                  ...cell.cell,
                  id: cell.cell.id || uuidv4()
                },
                theaterIndex: index,
                dateIndex: rowIndex
              };
            } else {
              // Create a new empty cell
              newRow[index] = {
                cell: null,
                theaterIndex: index,
                dateIndex: rowIndex
              };
            }
          }
        });
      }
      
      return newRow;
    });

    // Save the updated board
    return saveBoard({
      ...board,
      boardCells: newBoardCells
    });
  } catch (error) {
    console.error('Error renaming columns:', error);
    return false;
  }
}; 