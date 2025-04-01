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

export const loadBoardData = async (): Promise<BoardData | null> => {
  try {
    console.log('Loading board data...');
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to load board data');
    }
    const data = await response.json();
    console.log('Board data loaded:', {
      holdingAreaLength: data.holdingArea?.length || 0,
      boardCellsDimensions: `${data.boardCells?.length || 0}x${data.boardCells?.[0]?.length || 0}`,
      numberOfYears: data.numberOfYears || 1,
      visibleYears: data.visibleYears || [0],
    });
    return {
      holdingArea: data.holdingArea || [],
      boardCells: data.boardCells || [],
      numberOfYears: data.numberOfYears || 1,
      visibleYears: new Set(data.visibleYears || [0]),
    };
  } catch (error) {
    console.error('Error loading board data:', error);
    return null;
  }
}; 