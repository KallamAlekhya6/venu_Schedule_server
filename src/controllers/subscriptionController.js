import Subscription from '../models/Subscription.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private (Super Admin)
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('tenantId', 'name');
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Create or Update subscription
// @route   POST /api/subscriptions
// @access  Private (Super Admin)
export const manageSubscription = async (req, res) => {
  try {
    const { tenantId, plan, price, startDate, endDate, status } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    let subscription = await Subscription.findOne({ tenantId });

    if (subscription) {
      subscription.plan = plan || subscription.plan;
      subscription.price = price || subscription.price;
      subscription.startDate = startDate || subscription.startDate;
      subscription.endDate = endDate || subscription.endDate;
      subscription.status = status || subscription.status;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        tenantId,
        plan,
        price,
        startDate,
        endDate,
        status
      });
    }

    // Also update plan in Tenant model for sync
    tenant.plan = plan || tenant.plan;
    await tenant.save();

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
