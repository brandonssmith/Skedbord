import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem } from '@mui/material';
import { ChromePicker } from 'react-color';
import { v4 as uuidv4 } from 'uuid';
import { Theater, Cell, BoardCell } from '../types/board';
import ContextMenu from './ContextMenu';
import EditDialog from './EditDialog';
import { saveBoardData, loadBoardData } from '../utils/storage';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
import ImportDialog from './ImportDialog';

const theaters: Theater[] = [
  { name: 'Polson', screens: 6 },
  { name: 'Havre', screens: 4 },
  { name: 'Cut Bank', screens: 2 },
  { name: 'Lewistown', screens: 2 },
  { name: 'Wolf Point', screens: 2 },
  { name: 'Glasgow', screens: 2 },
  { name: 'Salmon', screens: 2 },
];

const columnLabels = [
  'Opening', 'Polson 1', 'Polson 2', 'Polson 3', 'Polson 4', 'Polson 5', 'Polson 6',
  'Dillon 1', 'Dillon 2', 'Salmon 1', 'Salmon 2', 'Havre 1', 'Havre 2', 'Havre 3', 'Havre 4',
  'Glasgow 1', 'Glasgow 2', 'Wolf Point 1', 'Wolf Point 2', 'Cutbank 1', 'Cutbank 2',
  'Lewistown 1', 'Lewistown 2'
];

const Board: React.FC = () => {
  const [holdingArea, setHoldingArea] = useState<Cell[]>([]);
  const [boardCells, setBoardCells] = useState<BoardCell[][]>([]);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    cell: BoardCell | null;
  } | null>(null);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    cell: BoardCell | null;
  }>({
    open: false,
    cell: null,
  });
  const [dates, setDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfYears, setNumberOfYears] = useState(1);
  const [visibleYears, setVisibleYears] = useState<Set<number>>(new Set([0]));
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printStartDate, setPrintStartDate] = useState<string>('');
  const [printEndDate, setPrintEndDate] = useState<string>('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [toolsMenuAnchor, setToolsMenuAnchor] = useState<null | HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate dates starting from March 21, 2025 (Friday)
    const startDate = new Date('2025-03-21');
    const newDates: Date[] = [];
    const weeksPerYear = 52;
    const totalWeeks = weeksPerYear * numberOfYears;
    
    for (let i = 0; i < totalWeeks; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (i * 7));
      // Ensure the date is a Friday
      while (date.getDay() !== 5) { // 5 represents Friday
        date.setDate(date.getDate() + 1);
      }
      newDates.push(date);
    }
    setDates(newDates);

    // Try to load saved data
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedData = await loadBoardData();
        console.log('Loaded saved data dimensions:', {
          boardCells: savedData?.boardCells ? `${savedData.boardCells.length}x${savedData.boardCells[0]?.length || 0}` : 'none',
          holdingArea: savedData?.holdingArea?.length || 0
        });
        
        if (savedData) {
          // Set the number of years and visible years from saved data
          setNumberOfYears(savedData.numberOfYears);
          setVisibleYears(new Set(savedData.visibleYears));
          
          if (savedData.boardCells) {
            // Ensure the loaded data has the correct structure and length
            const loadedBoardCells = savedData.boardCells.map((row, dateIndex) => {
              // Create a new row with the correct length
              const newRow = new Array(columnLabels.length).fill(null);
              // Copy existing cells
              row.forEach((cell, screenIndex) => {
                if (screenIndex < columnLabels.length) {
                  newRow[screenIndex] = {
                    ...cell,
                    theaterIndex: screenIndex,
                    dateIndex: dateIndex,
                  };
                }
              });
              return newRow;
            });
            
            setHoldingArea(savedData.holdingArea || []);
            setBoardCells(loadedBoardCells);
          } else {
            // Initialize empty board cells if no saved data
            console.log('Initializing empty board with:', { totalColumns: columnLabels.length, datesLength: newDates.length });
            
            const initialBoardCells: BoardCell[][] = Array(newDates.length)
              .fill(null)
              .map((_, dateIndex) => Array(columnLabels.length)
                .fill(null)
                .map((_, screenIndex) => ({
                  cell: null,
                  theaterIndex: screenIndex,
                  dateIndex: dateIndex,
                })));
            
            console.log('Initial board cells dimensions:', {
              rows: initialBoardCells.length,
              cols: initialBoardCells[0]?.length || 0
            });
            setBoardCells(initialBoardCells);
          }
        }
      } catch (error) {
        console.error('Error loading board data:', error);
        // Initialize empty board cells on error
        const initialBoardCells: BoardCell[][] = Array(newDates.length)
          .fill(null)
          .map((_, dateIndex) => Array(columnLabels.length)
            .fill(null)
            .map((_, screenIndex) => ({
              cell: null,
              theaterIndex: screenIndex,
              dateIndex: dateIndex,
            })));
        setBoardCells(initialBoardCells);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [numberOfYears]);

  // Save data whenever it changes
  useEffect(() => {
    if (boardCells.length > 0 && !isLoading) {
      saveBoardData(holdingArea, boardCells, numberOfYears, visibleYears);
    }
  }, [holdingArea, boardCells, numberOfYears, visibleYears, isLoading]);

  const handleCellClick = (dateIndex: number, screenIndex: number) => {
    console.log('Cell click:', { dateIndex, screenIndex, boardCells });
    
    if (!boardCells || boardCells.length === 0) {
      console.error('Board cells not initialized');
      return;
    }

    if (!boardCells[dateIndex]) {
      console.error('Invalid date index:', dateIndex);
      return;
    }

    if (!boardCells[dateIndex][screenIndex]) {
      console.error('Invalid screen index:', screenIndex);
      return;
    }

    const cell = boardCells[dateIndex][screenIndex];
    if (cell.cell?.isLocked) return;
    setEditDialog({
      open: true,
      cell: {
        ...cell,
        dateIndex,
        theaterIndex: screenIndex,
      },
    });
  };

  const handleCellContextMenu = (event: React.MouseEvent, dateIndex: number, screenIndex: number) => {
    event.preventDefault();
    setContextMenu({
      position: { x: event.clientX, y: event.clientY },
      cell: {
        ...boardCells[dateIndex][screenIndex],
        dateIndex,
        theaterIndex: screenIndex,
      },
    });
  };

  const handleDragStart = (event: React.DragEvent, cell: Cell) => {
    event.dataTransfer.setData('text/plain', cell.id);
  };

  const handleDrop = (event: React.DragEvent, dateIndex: number, screenIndex: number) => {
    event.preventDefault();
    const cellId = event.dataTransfer.getData('text/plain');
    const draggedCell = holdingArea.find(cell => cell.id === cellId) || 
                       boardCells.flat().find(cell => cell.cell?.id === cellId)?.cell;

    if (draggedCell) {
      const newBoardCells = [...boardCells];
      
      // Ensure the target cell exists with the correct structure
      if (!newBoardCells[dateIndex][screenIndex]) {
        newBoardCells[dateIndex][screenIndex] = {
          cell: null,
          theaterIndex: screenIndex,
          dateIndex: dateIndex,
        };
      }
      
      const targetCell = newBoardCells[dateIndex][screenIndex];
      
      if (targetCell.cell) {
        setHoldingArea(prev => [...prev, targetCell.cell!]);
      }
      
      targetCell.cell = draggedCell;
      setBoardCells(newBoardCells);
      setHoldingArea(prev => prev.filter(cell => cell.id !== cellId));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleLockToggle = () => {
    if (contextMenu?.cell) {
      const newBoardCells = [...boardCells];
      const cell = newBoardCells[contextMenu.cell.dateIndex][contextMenu.cell.theaterIndex];
      if (cell.cell) {
        cell.cell.isLocked = !cell.cell.isLocked;
        setBoardCells(newBoardCells);
      }
    }
    setContextMenu(null);
  };

  const handleColorSelect = (color: string) => {
    if (contextMenu?.cell) {
      const newBoardCells = [...boardCells];
      const targetCell = newBoardCells[contextMenu.cell.dateIndex][contextMenu.cell.theaterIndex];
      
      // Ensure the target cell exists with the correct structure
      if (!targetCell) {
        newBoardCells[contextMenu.cell.dateIndex][contextMenu.cell.theaterIndex] = {
          cell: null,
          theaterIndex: contextMenu.cell.theaterIndex,
          dateIndex: contextMenu.cell.dateIndex,
        };
      }
      
      // Create a new cell if none exists or if the cell is null
      if (!targetCell.cell) {
        targetCell.cell = {
          id: uuidv4(),
          content: '',
          isLocked: false,
          color: color,
        };
      } else {
        targetCell.cell.color = color;
      }
      
      setBoardCells(newBoardCells);
    }
    setContextMenu(null);
  };

  const handleEditSave = (content: string, fontFamily: string, textColor: string) => {
    if (editDialog.cell) {
      const newBoardCells = [...boardCells];
      const cell = newBoardCells[editDialog.cell.dateIndex][editDialog.cell.theaterIndex];
      if (cell.cell) {
        cell.cell.content = content;
        cell.cell.fontFamily = fontFamily;
        cell.cell.textColor = textColor;
        setBoardCells(newBoardCells);
      } else {
        // Create a new cell if none exists
        cell.cell = {
          id: uuidv4(),
          content: content,
          isLocked: false,
          color: '#ffffff',
          fontFamily: fontFamily,
          textColor: textColor,
        };
        setBoardCells(newBoardCells);
      }
    }
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      cell: null,
    });
  };

  // Function to get the year index for a date
  const getYearIndex = (date: Date) => {
    const startDate = new Date('2025-03-21');
    const yearDiff = date.getFullYear() - startDate.getFullYear();
    return yearDiff;
  };

  // Function to toggle year visibility
  const toggleYear = (yearIndex: number) => {
    setVisibleYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yearIndex)) {
        newSet.delete(yearIndex);
      } else {
        newSet.add(yearIndex);
      }
      return newSet;
    });
  };

  const handleAddYear = () => {
    try {
      const newYearIndex = numberOfYears;
      const weeksPerYear = 52;
      
      // Update the number of years first
      setNumberOfYears(prev => prev + 1);
      
      // Update visible years to include the new year
      setVisibleYears(prev => new Set([...prev, newYearIndex]));
      
      // The dates and board cells will be updated by the useEffect
      // that watches numberOfYears
      
      // Save the updated state
      saveBoardData(holdingArea, boardCells, numberOfYears + 1, new Set([...visibleYears, newYearIndex]));
    } catch (error) {
      console.error('Error adding new year:', error);
      alert('Error adding new year. Please try again.');
    }
  };

  const handlePrint = () => {
    try {
      console.log('Starting PDF generation...');
      const startDate = new Date(printStartDate);
      const endDate = new Date(printEndDate);
      
      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Please select valid start and end dates');
        return;
      }

      if (startDate > endDate) {
        alert('Start date must be before end date');
        return;
      }
      
      // Filter dates within the selected range
      const selectedDates = dates.filter(date => 
        date >= startDate && date <= endDate
      );
      console.log('Selected dates:', selectedDates.length);

      // Limit the number of dates to prevent large files
      const MAX_DATES = 52; // One year of weekly dates
      if (selectedDates.length > MAX_DATES) {
        alert(`Too many dates selected. Please limit the date range to ${MAX_DATES} weeks or less.`);
        return;
      }

      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '0';
      tempDiv.style.top = '0';
      tempDiv.style.width = '100%';
      tempDiv.style.height = '100%';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.zIndex = '9999';
      tempDiv.style.padding = '20px';
      tempDiv.style.overflow = 'auto';

      // Add title and date range
      const content = `
        <div style="font-family: Arial, sans-serif; transform-origin: top left;">
          <h1 style="font-size: 16px; margin-bottom: 8px;">Polson SkedBord</h1>
          <p style="font-size: 12px; margin-bottom: 12px;">Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 4px; text-align: left; background-color: #f5f5f5; width: 60px;">Date</th>
                ${columnLabels.slice(1).map(label => 
                  `<th style="border: 1px solid #ccc; padding: 4px; text-align: center; background-color: #f5f5f5; width: ${100/(columnLabels.length)}%;">${label}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${selectedDates.map(date => {
                const dateIndex = dates.indexOf(date);
                const dateCells = boardCells[dateIndex] || [];
                return `
                  <tr>
                    <td style="border: 1px solid #ccc; padding: 4px; text-align: left; width: 60px;">${date.toLocaleDateString()}</td>
                    ${dateCells.slice(1).map(cell => {
                      const content = cell?.cell?.content || '';
                      const color = cell?.cell?.color || '#ffffff';
                      const isLocked = cell?.cell?.isLocked || false;
                      const textColor = color === '#ffffff' ? '#000000' : 
                        ((parseInt(color.slice(1, 3), 16) * 0.299 + 
                          parseInt(color.slice(3, 5), 16) * 0.587 + 
                          parseInt(color.slice(5, 7), 16) * 0.114) > 128 ? '#000000' : '#ffffff');
                      return `
                        <td style="
                          border: 1px solid #ccc; 
                          padding: 4px; 
                          text-align: center;
                          background-color: ${color};
                          color: ${textColor};
                          font-weight: ${isLocked ? 'bold' : 'normal'};
                          width: ${100/(columnLabels.length)}%;
                          font-size: 8px;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                        ">${content}</td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      tempDiv.innerHTML = content;
      document.body.appendChild(tempDiv);

      // Wait for the content to be rendered
      setTimeout(() => {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        // Use html2canvas to capture the rendered content
        import('html2canvas').then(({ default: html2canvas }) => {
          html2canvas(tempDiv, {
            scale: 3, // Increased scale for better quality
            useCORS: true,
            logging: true,
            backgroundColor: '#ffffff',
            width: tempDiv.scrollWidth,
            height: tempDiv.scrollHeight,
            windowWidth: tempDiv.scrollWidth,
            windowHeight: tempDiv.scrollHeight
          }).then(canvas => {
            // Add the image to the PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            
            // Calculate scaling to fit the width while maintaining aspect ratio
            const aspectRatio = canvas.height / canvas.width;
            const imgWidth = pdfWidth - 10; // Leave 5mm margin on each side
            const imgHeight = imgWidth * aspectRatio;
            
            // Center the image on the page
            const xOffset = 5; // 5mm margin from left
            const yOffset = (pdfHeight - imgHeight) / 2; // Center vertically
            
            doc.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
            
            // Save the PDF
            const filename = `SkedBord_${startDate.toLocaleDateString()}_${endDate.toLocaleDateString()}.pdf`;
            doc.save(filename);
            
            // Clean up
            document.body.removeChild(tempDiv);
            setPrintDialogOpen(false);
          }).catch(error => {
            console.error('Error generating canvas:', error);
            document.body.removeChild(tempDiv);
            throw error;
          });
        }).catch(error => {
          console.error('Error loading html2canvas:', error);
          document.body.removeChild(tempDiv);
          throw error;
        });
      }, 500);

    } catch (error) {
      console.error('Detailed error in PDF generation:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  const handleExport = () => {
    try {
      const startDate = new Date(exportStartDate);
      const endDate = new Date(exportEndDate);
      
      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Please select valid start and end dates');
        return;
      }

      if (startDate > endDate) {
        alert('Start date must be before end date');
        return;
      }
      
      // Filter dates within the selected range
      const selectedDates = dates.filter(date => 
        date >= startDate && date <= endDate
      );

      // Function to escape and quote CSV fields
      const escapeField = (field: string) => {
        // Replace any quotes with double quotes and wrap the field in quotes
        const escaped = field.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      // Create CSV content - exclude the Opening column
      const headers = ['Date', ...columnLabels.slice(1)]; // Skip the Opening column
      const rows = selectedDates.map(date => {
        const dateIndex = dates.indexOf(date);
        if (dateIndex === -1) {
          console.error('Date not found in dates array:', date);
          return [];
        }

        // Get all cells for this date
        const dateCells = boardCells[dateIndex] || [];
        
        // Create row data, skipping the Opening column and properly escaping fields
        const rowData = [
          escapeField(date.toLocaleDateString()),
          ...dateCells.slice(1).map(cell => escapeField(cell?.cell?.content || ''))
        ];

        return rowData;
      });

      // Combine headers and rows, escaping header fields
      const csvContent = [
        headers.map(header => escapeField(header)).join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Add BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csvContentWithBOM = BOM + csvContent;

      // Create and trigger download
      const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `SkedBord_${startDate.toLocaleDateString()}_${endDate.toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close the export dialog
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('An error occurred while exporting the data. Please try again.');
    }
  };

  const handleToolsClick = (event: React.MouseEvent<HTMLElement>) => {
    setToolsMenuAnchor(event.currentTarget);
  };

  const handleToolsClose = () => {
    setToolsMenuAnchor(null);
  };

  const handleToolsItemClick = (action: 'print' | 'export' | 'import') => {
    handleToolsClose();
    switch (action) {
      case 'print':
        setPrintDialogOpen(true);
        break;
      case 'export':
        setExportDialogOpen(true);
        break;
      case 'import':
        setImportDialogOpen(true);
        break;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading board data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Holding Area */}
      <Paper
        sx={{
          width: 200,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto',
          position: 'relative',
          height: '100vh',
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Polson SkedBord
        </Typography>
        <Button
          variant="contained"
          onClick={handleToolsClick}
          color="primary"
          sx={{ mb: 2 }}
        >
          Tools
        </Button>
        <Menu
          anchorEl={toolsMenuAnchor}
          open={Boolean(toolsMenuAnchor)}
          onClose={handleToolsClose}
        >
          <MenuItem onClick={() => handleToolsItemClick('print')}>Print to PDF</MenuItem>
          <MenuItem onClick={() => handleToolsItemClick('export')}>Export Data</MenuItem>
          <MenuItem onClick={() => handleToolsItemClick('import')}>Import Data</MenuItem>
        </Menu>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {holdingArea.map((cell) => (
            <Paper
              key={cell.id}
              draggable
              onDragStart={(e) => handleDragStart(e, cell)}
              sx={{
                p: 1,
                minHeight: 60,
                border: '1px solid #ccc',
                position: 'relative',
                mb: 1,
              }}
            >
              {cell.content}
              {cell.isLocked && (
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    fontSize: '0.8rem',
                  }}
                >
                  🔒
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={handleAddYear}
            sx={{ mb: 1 }}
          >
            Add Year
          </Button>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {Array.from({ length: numberOfYears }, (_, i) => (
              <Button
                key={i}
                variant={visibleYears.has(i) ? "contained" : "outlined"}
                onClick={() => toggleYear(i)}
                size="small"
              >
                {2025 + i}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Main Board */}
      <Box
        ref={boardRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          maxWidth: '4400px',
          position: 'relative',
          '& > *': {
            minWidth: '4400px',
          },
        }}
      >
        <Grid container spacing={0}>
          {/* Theater Headers */}
          <Grid item xs={12} sx={{ position: 'sticky', top: 0, zIndex: 3, backgroundColor: 'white' }}>
            <Grid container sx={{ 
              display: 'flex', 
              flexWrap: 'nowrap',
              borderBottom: '1px solid #ccc',
              '& > *': {
                padding: '8px 0',
              }
            }}>
              <Grid item sx={{ 
                flex: '0 0 auto', 
                width: '110px',
                position: 'sticky',
                left: 0,
                backgroundColor: 'white',
                zIndex: 4
              }}>
                <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                  Date
                </Typography>
              </Grid>
              {columnLabels.map((label, index) => (
                <Grid item key={index} sx={{ flex: '0 0 auto', width: '220px' }}>
                  <Typography variant="subtitle1" sx={{ textAlign: 'center', width: '100%' }}>
                    {label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Board Cells */}
          {dates.map((date, dateIndex) => {
            const yearIndex = getYearIndex(date);
            if (!visibleYears.has(yearIndex)) return null;
            
            return (
              <Grid item xs={12} key={date.toISOString()}>
                <Grid container sx={{ display: 'flex', flexWrap: 'nowrap' }}>
                  <Grid item sx={{ 
                    flex: '0 0 auto', 
                    width: '110px', 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'white',
                    zIndex: 1,
                    borderRight: '1px solid #ccc',
                    padding: '0 8px'
                  }}>
                    <Typography variant="body2">
                      {date.toLocaleDateString()}
                    </Typography>
                  </Grid>
                  {Array(columnLabels.length).fill(null).map((_, screenIndex) => (
                    <Grid item key={`${dateIndex}-${screenIndex}`} sx={{ flex: '0 0 auto', width: '220px' }}>
                      <Paper
                        sx={{
                          height: 60,
                          p: 0,
                          cursor: boardCells[dateIndex]?.[screenIndex]?.cell?.isLocked ? 'not-allowed' : 'pointer',
                          border: '1px solid #ccc',
                          position: 'relative',
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textAlign: 'center',
                          margin: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: boardCells[dateIndex]?.[screenIndex]?.cell?.color || '#ffffff',
                          '& > *:not(.lock-icon)': {
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            fontSize: 'clamp(0.5rem, 2.5vw, 1rem)',
                            lineHeight: 1.2,
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            padding: '4px',
                            fontFamily: boardCells[dateIndex]?.[screenIndex]?.cell?.fontFamily || 'Arial, sans-serif',
                            color: boardCells[dateIndex]?.[screenIndex]?.cell?.textColor || '#000000',
                          }
                        }}
                        onClick={() => handleCellClick(dateIndex, screenIndex)}
                        onContextMenu={(e) => handleCellContextMenu(e, dateIndex, screenIndex)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dateIndex, screenIndex)}
                      >
                        <Box>
                          {boardCells[dateIndex]?.[screenIndex]?.cell?.content}
                        </Box>
                        {boardCells[dateIndex]?.[screenIndex]?.cell?.isLocked && (
                          <Typography
                            className="lock-icon"
                            sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              fontSize: '0.8rem',
                              pointerEvents: 'none',
                              zIndex: 1,
                            }}
                          >
                            🔒
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          onClose={handleContextMenuClose}
          onLock={handleLockToggle}
          onUnlock={handleLockToggle}
          isLocked={contextMenu.cell?.cell?.isLocked || false}
          onColorSelect={handleColorSelect}
          currentColor={contextMenu.cell?.cell?.color || '#ffffff'}
        />
      )}

      {/* Edit Dialog */}
      <EditDialog
        open={editDialog.open}
        onClose={handleEditClose}
        onSave={handleEditSave}
        initialContent={editDialog.cell?.cell?.content || ''}
        initialFontFamily={editDialog.cell?.cell?.fontFamily || 'Arial, sans-serif'}
        initialTextColor={editDialog.cell?.cell?.textColor || '#000000'}
      />

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)}>
        <DialogTitle>Print Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={printStartDate}
              onChange={(e) => setPrintStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={printEndDate}
              onChange={(e) => setPrintEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePrint} variant="contained" color="primary">
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained" color="primary">
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />
    </Box>
  );
};

export default Board; 