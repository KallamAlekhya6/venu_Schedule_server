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
        // Plan limits mapping (simplified)
        const planLimits = {
            free: { maxVenues: 1, maxRooms: 2, maxResources: 5, allowRecurring: false },
            basic: { maxVenues: 3, maxRooms: 10, maxResources: 25, allowRecurring: true },
            premium: { maxVenues: 10, maxRooms: 50, maxResources: 200, allowRecurring: true, customBranding: true }
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
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Server Error' });
        }
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
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Server Error' });
        }
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
