import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import complaintRoutes from './routes/complaints.js';
import plannerRoutes from './routes/planner.js';
import creativeRoutes from './routes/creative.js';
import enquiryRoutes from './routes/enquiry.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'https://achievers-library.vercel.app',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .catch(err => {}); // removed error logging for production

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/creative', creativeRoutes);
app.use('/api/enquiry', enquiryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});