import express from 'express';
import nodemailer from 'nodemailer';
import Enquiry from '../models/Enquiry.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    
    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      console.error('Missing environment variables for email! EMAIL_USER:', !!process.env.EMAIL_USER, 'EMAIL_PASS:', !!process.env.EMAIL_PASS, 'ADMIN_EMAIL:', !!process.env.ADMIN_EMAIL);
    }

    console.log('Attempting to save enquiry to DB...', { name, email, contact });
    // Save to DB
    const enquiry = new Enquiry({ name, email, contact });
    await enquiry.save();
    console.log('Enquiry saved to DB successfully.');

    console.log('Attempting to send email from', process.env.EMAIL_USER, 'to', process.env.ADMIN_EMAIL);
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Library Enquiry',
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Contact:</strong> ${contact}</p>`
    });
    console.log('Email sent successfully.');
    res.json({ message: 'Enquiry sent successfully' });
  } catch (err) {
    console.error('Error in enquiry POST route:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

export default router;