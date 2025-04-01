import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardRoutes from './routes/board.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/board', boardRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 