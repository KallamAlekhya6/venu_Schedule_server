import Venue from '../models/Venue.js';
import Room from '../models/Room.js';
import Resource from '../models/Resource.js';
import Booking from '../models/Booking.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [venuesCount, roomsCount, resourcesCount, bookingsThisMonth, pendingBookings] = await Promise.all([
      Venue.countDocuments({ tenantId }),
      Room.countDocuments({ tenantId }),
      Resource.countDocuments({ tenantId }),
      Booking.countDocuments({ tenantId, start: { $gte: firstDayOfMonth } }),
      Booking.countDocuments({ tenantId, status: 'pending' })
    ]);

    // Monthly bookings trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await Booking.countDocuments({ 
        tenantId, 
        start: { $gte: monthStart, $lte: monthEnd } 
      });
      monthlyTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalVenues: venuesCount,
        totalRooms: roomsCount,
        totalResources: resourcesCount,
        totalBookings: bookingsThisMonth,
        pendingBookings,
        monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
