const express = require('express');
const User = require('../models/User');
const router = express.Router();


// POST endpoint to get user by email
router.post('/get-user', async (req, res) => {
  console.log("Received request with body:", req.body); // Debug log
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log("Email missing in request");
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log("Searching for user with email:", email);
    const user = await User.findOne({ email: email.trim() }).lean();
    
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("User found:", user);
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        qrCodeId: user.qrCodeId || user._id.toString()
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

router.post('/user-login', async (req, res) => {
  console.log("Received login request:", req.body);

  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const user = await User.findOne({
      email: email.trim(),
      phone: phone.trim()
    }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        qrCodeId: user.qrCodeId || user._id.toString()
      }
    });

  } catch (error) {
    console.error('Server error during login:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});


router.get('/get-all-users', async (req, res) => {
  console.log("GET /get-all-users called");
  try {
    const users = await User.find({}).lean();
    console.log("Users fetched:", users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// Add this at the top of your file
const { v4: uuidv4 } = require('uuid');

// Update your register endpoint
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    
    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        qrCode: existingUser.qrCode // Return existing QR code
      });
    }

    const newUser = new User({ 
      fullName, 
      email, 
      phone,
      qrCode: uuidv4() // Generate QR code here
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      success: true,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        qrCode: newUser.qrCode
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});


router.post('/check-in', async (req, res) => {
  try {
    const { qrCodeId } = req.body;

    const user = await User.findOneAndUpdate(
      { qrCode: qrCodeId },
      { isCheckedIn: true },
      { new: true }
    ).select('fullName email phone isCheckedIn qrCode');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;