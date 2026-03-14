import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import jwt from 'jsonwebtoken';

// @desc    Register user and tenant
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { organizationName, adminName, email, password, plan } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user placeholder (without tenantId first)
    const user = await User.create({
      name: adminName,
      email,
      password,
      role: 'tenant_admin'
    });

    // Plan limits mapping
    const planLimits = {
      free: { maxVenues: 2, maxRooms: 5, maxResources: 10, maxBookings: 20, allowRecurring: false },
      basic: { maxVenues: 10, maxRooms: 25, maxResources: 50, maxBookings: 100, allowRecurring: true },
      premium: { maxVenues: 999999, maxRooms: 999999, maxResources: 999999, maxBookings: 999999, allowRecurring: true, customBranding: true }
    };

    // Create tenant
    const tenant = await Tenant.create({
      name: organizationName,
      plan: plan || 'free',
      adminId: user._id,
      settings: planLimits[plan || 'free']
    });

    // Update user with tenantId
    user.tenantId = tenant._id;
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Register staff for an organization
// @route   POST /api/auth/register-staff
// @access  Public
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if tenant exists
    if (!tenantId) {
      return res.status(400).json({ message: 'Please select an organization' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Create user with pending status
    const user = await User.create({
      name,
      email,
      password,
      role: 'staff',
      tenantId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending approval by your organization administrator.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all organizations for public signup
// @route   GET /api/auth/tenants
// @access  Public
export const getPublicTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({}).select('name _id');
    res.status(200).json({
      success: true,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check status
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact your organization administrator.' 
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Please contact your organization administrator.' 
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
};
