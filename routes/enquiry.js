import express from 'express';
import Enquiry from '../models/Enquiry.js';

const router = express.Router();

// GET all enquiries
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// POST new enquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    
    console.log('Attempting to save enquiry to DB...', { name, email, contact });
    // Save to DB
    const enquiry = new Enquiry({ name, email, contact });
    await enquiry.save();
    console.log('Enquiry saved to DB successfully.');

    res.json({ message: 'Enquiry sent successfully' });
  } catch (err) {
    console.error('Error in enquiry POST route:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

export default router;