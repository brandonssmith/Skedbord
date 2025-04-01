import express from 'express';
import { loadBoard, saveBoard, renameColumns } from '../storage.js';

const router = express.Router();

// Get the current board state
router.get('/', (req, res) => {
  try {
    console.log('Received GET request for board data');
    const board = loadBoard();
    console.log('Sending board data:', board);
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Error fetching board data' });
  }
});

// Update the board state
router.post('/', (req, res) => {
  try {
    console.log('Received POST request with data:', req.body);
    const { holdingArea, boardCells, numberOfYears, visibleYears } = req.body;
    const success = saveBoard({ 
      holdingArea, 
      boardCells,
      numberOfYears,
      visibleYears
    });
    
    if (success) {
      console.log('Board data saved successfully');
      const updatedBoard = loadBoard();
      console.log('Sending updated board data:', updatedBoard);
      res.json(updatedBoard);
    } else {
      console.error('Failed to save board data');
      res.status(500).json({ message: 'Error saving board data' });
    }
  } catch (error) {
    console.error('Error saving board:', error);
    res.status(500).json({ message: 'Error saving board data' });
  }
});

// Rename columns
router.post('/rename-columns', (req, res) => {
  try {
    console.log('Received column renaming request:', req.body);
    const { columnNames } = req.body;
    
    if (!Array.isArray(columnNames)) {
      return res.status(400).json({ message: 'Column names must be provided as an array' });
    }

    const success = renameColumns(columnNames);
    
    if (success) {
      console.log('Columns renamed successfully');
      const updatedBoard = loadBoard();
      console.log('Sending updated board data:', updatedBoard);
      res.json(updatedBoard);
    } else {
      console.error('Failed to rename columns');
      res.status(500).json({ message: 'Error renaming columns' });
    }
  } catch (error) {
    console.error('Error renaming columns:', error);
    res.status(500).json({ message: 'Error renaming columns' });
  }
});

export default router; 