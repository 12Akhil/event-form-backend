const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  qrCode: { type: String, unique: true },
  isCheckedIn: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);