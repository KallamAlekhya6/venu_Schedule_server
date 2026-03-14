import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';

// @desc    Get rooms for a venue
// @route   GET /api/rooms/:venueId
// @access  Private
export const getRooms = async (req, res) => {
  try {
    const query = { venueId: req.params.venueId };
    if (req.user.role !== 'super_admin') {
      query.tenantId = req.user.tenantId;
    }
    const rooms = await Room.find(query);
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Tenant Admin)
export const createRoom = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const roomCount = await Room.countDocuments({ tenantId: req.user.tenantId });
    if (roomCount >= (tenant.settings?.maxRooms || 0)) {
      return res.status(403).json({ 
        message: `Plan limit reached. Your current plan allows a maximum of ${tenant.settings.maxRooms} rooms.` 
      });
    }

    req.body.tenantId = req.user.tenantId;
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};
