import Venue from '../models/Venue.js';
// @desc    Get all venues for tenant
// @route   GET /api/venues
// @access  Private
export const getVenues = async (req, res) => {
    try {
        const venues = await Venue.find({ tenantId: req.user.tenantId });
        res.status(200).json({ success: true, count: venues.length, data: venues });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Create new venue
// @route   POST /api/venues
// @access  Private (Tenant Admin)
export const createVenue = async (req, res) => {
    try {
        req.body.tenantId = req.user.tenantId;
        const venue = await Venue.create(req.body);
        res.status(201).json({ success: true, data: venue });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'Invalid data' });
        }
    }
};
