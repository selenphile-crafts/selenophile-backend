import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  contact: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Enquiry', enquirySchema);