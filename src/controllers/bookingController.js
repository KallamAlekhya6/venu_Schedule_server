import Booking from '../models/Booking.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all bookings for tenant
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const query = req.user.role === 'super_admin' ? {} : { tenantId: req.user.tenantId };
    const bookings = await Booking.find(query)
      .populate('venueId', 'name')
      .populate('roomId', 'name capacity')
      .populate('userId', 'name email');
      
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { roomId, start, end } = req.body;
    
    req.body.tenantId = req.user.tenantId;
    req.body.userId = req.user._id;

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check monthly booking limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const bookingCount = await Booking.countDocuments({ 
      tenantId: req.user.tenantId,
      createdAt: { $gte: startOfMonth }
    });

    if (bookingCount >= (tenant.settings?.maxBookings || 0)) {
      return res.status(403).json({ 
        message: `Monthly booking limit reached. Your current plan allows a maximum of ${tenant.settings.maxBookings} bookings per month.` 
      });
    }

    if (req.body.isRecurring && !tenant.settings?.allowRecurring) {
      return res.status(403).json({ 
        message: 'Recurring bookings are not allowed on your current plan. Please upgrade to a higher plan.' 
      });
    }

    // Basic overlap check
    const overlap = await Booking.findOne({
      roomId,
      status: { $ne: 'rejected' },
      $or: [
        { start: { $lt: end, $gte: start } },
        { end: { $gt: start, $lte: end } },
        { start: { $lte: start }, end: { $gte: end } }
      ]
    });

    if (overlap) {
      return res.status(400).json({ 
        message: 'This room is already booked for the selected time slot' 
      });
    }

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid data' });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Tenant Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (req.user.role !== 'super_admin' && booking.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'super_admin' && booking.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Simple overlap check if times or room change
    if (req.body.start || req.body.end || req.body.roomId) {
      const roomId = req.body.roomId || booking.roomId;
      const start = req.body.start || booking.start;
      const end = req.body.end || booking.end;
      
      const overlap = await Booking.findOne({
        _id: { $ne: booking._id },
        roomId,
        status: { $ne: 'rejected' },
        $or: [
          { start: { $lt: end, $gte: start } },
          { end: { $gt: start, $lte: end } },
          { start: { $lte: start }, end: { $gte: end } }
        ]
      });

      if (overlap) {
        return res.status(400).json({ message: 'This room is already booked for the selected time slot' });
      }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role !== 'super_admin' && booking.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
