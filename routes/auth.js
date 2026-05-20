import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register (pending status)
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, contact, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, contact, password: hashed, status: 'pending' });
    await user.save();
    res.status(201).json({ message: 'User registered, waiting for admin approval' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login – Admin first, then active members
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ADMIN STEP 1 – hardcoded credentials from .env
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().replace(/^['"]|['"]$/g, '');
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim().replace(/^['"]|['"]$/g, '');

    if (email && email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
      const token = jwt.sign(
        { role: 'admin-pending', step: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.json({
        token,
        user: { firstName: 'Admin', email, role: 'admin-pending' }
      });
    }

    // Normal member login – check database
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account not activated' });

    const token = jwt.sign(
      { userId: user._id, role: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, firstName: user.firstName, email: user.email, status: user.status, role: 'member' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin first step (hardcoded credentials) – kept for reference
router.post('/admin-first', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

// Admin second step (hardcoded ID + password)
router.post('/admin-second', (req, res) => {
  const { adminId, adminPassword } = req.body;
  const targetAdminId = (process.env.ADMIN_ID || '').trim().replace(/^['"]|['"]$/g, '');
  const targetAdminSecondPassword = (process.env.ADMIN_SECOND_PASSWORD || '').trim().replace(/^['"]|['"]$/g, '');

  if (adminId === targetAdminId && adminPassword === targetAdminSecondPassword) {
    const token = jwt.sign({ userId: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ success: false, message: 'Invalid admin ID or password' });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { firstName, email, contact, newPassword } = req.body;
    
    // Find user by matching all three fields (case-insensitive for email/name depending on how stored, but direct match is fine)
    // Using RegExp for case-insensitive match on firstName and email to be safe
    const user = await User.findOne({
      firstName: new RegExp('^' + firstName + '$', 'i'),
      email: new RegExp('^' + email + '$', 'i'),
      contact
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found or details do not match.' });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;