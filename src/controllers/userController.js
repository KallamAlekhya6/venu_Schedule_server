import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin)
export const getAllUsers = async (req, res) => {
  try {
    let users;
    if (req.user.role === 'super_admin') {
        users = await User.find({}).select('-password');
    } else {
        users = await User.find({ tenantId: req.user.tenantId }).select('-password');
    }
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Super Admin / Tenant Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    // Validate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role and tenant validation
    let assignedTenantId = req.user.tenantId;

    if (req.user.role === 'super_admin') {
      assignedTenantId = tenantId || null; // Super admin can assign organizations
    } else {
      // Tenant admins can only create staff for their org
      if (role === 'super_admin' || role === 'tenant_admin') {
         return res.status(403).json({ message: 'Not authorized to create this role' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: req.user.role === 'super_admin' ? (role || 'staff') : 'staff',
      tenantId: assignedTenantId
    });

    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update user status (Approve/Suspend)
// @route   PUT /api/users/:id/status
// @access  Private (Tenant Admin / Super Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Authorization check
    if (req.user.role !== 'super_admin') {
        if (!user.tenantId || user.tenantId.toString() !== req.user.tenantId.toString() || req.user.role !== 'tenant_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      data: { id: user._id, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Tenant Admin / Super Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Authorization check
    if (req.user.role !== 'super_admin') {
        if (!user.tenantId || user.tenantId.toString() !== req.user.tenantId.toString() || req.user.role !== 'tenant_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
