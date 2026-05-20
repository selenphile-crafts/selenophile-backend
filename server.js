import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import complaintRoutes from './routes/complaints.js';
import plannerRoutes from './routes/planner.js';
import creativeRoutes from './routes/creative.js';

// Set DNS servers to Google and Cloudflare DNS to bypass local router DNS resolution failures of MongoDB SRV records
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

dotenv.config();
const app = express();

// Middleware  for website
app.use(cors());
app.use(express.json());
// app.use(cors({
//   origin: 'https://achievers-library.vercel.app'
//   ,credentials: true
// }));
// app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MONGODB CONNECTION ERROR:');
    console.error(err);
    console.error('If you are seeing buffering timeouts, please check your MongoDB Atlas Network Access IP Whitelist.');
  });
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/creative', creativeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});