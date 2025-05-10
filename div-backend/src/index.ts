// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import chat route
import chatRouter from './routes/chat';

// Create an instance of Express
const app = express();

// Use CORS to allow cross-origin requests (useful for testing with your Expo app)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount the chat endpoint at /chat
app.use('/chat', chatRouter);

// Define a port and start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
