import { Cell, BoardCell } from '../types/board';

const API_URL = 'http://localhost:3001/api/board';

interface BoardData {
  holdingArea: Cell[];
  boardCells: BoardCell[][];
  numberOfYears: number;
  visibleYears: number[];
}

export const saveBoardData = async (holdingArea: Cell[], boardCells: BoardCell[][], numberOfYears: number, visibleYears: Set<number>) => {
  try {
    const data: BoardData = {
      holdingArea,
      boardCells,
      numberOfYears,
      visibleYears: Array.from(visibleYears),
    };
    
    console.log('Saving board data:', {
      holdingAreaLength: holdingArea.length,
      boardCellsDimensions: `${boardCells.length}x${boardCells[0]?.length || 0}`,
      numberOfYears,
      visibleYears: Array.from(visibleYears),
    });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save board data');
    }
    console.log('Board data saved successfully');
  } catch (error) {
    console.error('Error saving board data:', error);
    throw error;
  }
};

export const loadBoardData = async (): Promise<{
  holdingArea: Cell[];
  boardCells: BoardCell[][];
  numberOfYears: number;
  visibleYears: number[];
} | null> => {
  try {
    const data = localStorage.getItem('boardData');
    if (!data) return null;

    const parsedData = JSON.parse(data);
    return {
      holdingArea: parsedData.holdingArea || [],
      boardCells: parsedData.boardCells || [],
      numberOfYears: parsedData.numberOfYears || 1,
      visibleYears: Array.from(parsedData.visibleYears || [0]),
    };
  } catch (error) {
    console.error('Error loading board data:', error);
    return null;
  }
}; 