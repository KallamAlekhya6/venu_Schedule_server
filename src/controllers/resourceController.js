import Resource from '../models/Resource.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all resources for tenant
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const query = req.user.role === 'super_admin' ? {} : { tenantId: req.user.tenantId };
    const resources = await Resource.find(query)
      .populate('roomId', 'name');
    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Tenant Admin)
export const createResource = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const resourceCount = await Resource.countDocuments({ tenantId: req.user.tenantId });
    if (resourceCount >= (tenant.settings?.maxResources || 0)) {
      return res.status(403).json({ 
        message: `Plan limit reached. Your current plan allows a maximum of ${tenant.settings.maxResources} resources.` 
      });
    }

    req.body.tenantId = req.user.tenantId;
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};
