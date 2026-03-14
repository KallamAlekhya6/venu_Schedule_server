import Venue from '../models/Venue.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all venues for tenant
// @route   GET /api/venues
// @access  Private
export const getVenues = async (req, res) => {
  try {
    const query = req.user.role === 'super_admin' ? {} : { tenantId: req.user.tenantId };
    const venues = await Venue.find(query);
    res.status(200).json({ success: true, count: venues.length, data: venues });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new venue
// @route   POST /api/venues
// @access  Private (Tenant Admin)
export const createVenue = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const venueCount = await Venue.countDocuments({ tenantId: req.user.tenantId });
    if (venueCount >= (tenant.settings?.maxVenues || 0)) {
      return res.status(403).json({ 
        message: `Plan limit reached. Your current plan allows a maximum of ${tenant.settings.maxVenues} venues.` 
      });
    }

    req.body.tenantId = req.user.tenantId;
    const venue = await Venue.create(req.body);
    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};
