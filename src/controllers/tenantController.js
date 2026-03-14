import Tenant from '../models/Tenant.js';

// @desc    Get current tenant details
// @route   GET /api/tenants/me
// @access  Private
export const getMyTenant = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user.tenantId) {
      return res.status(404).json({ message: 'No tenant associated with this user' });
    }

    const tenant = await Tenant.findById(req.user.tenantId);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Super Admin)
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({});
    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
