import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an organization name'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  email: String,
  phone: String,
  address: String,
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    maxVenues: Number,
    maxRooms: Number,
    maxResources: Number,
    maxBookings: Number,
    allowRecurring: Boolean,
    customBranding: Boolean
  }
}, {
  timestamps: true
});

// Create tenant slug from the name
tenantSchema.pre('save', function() {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
});

export default mongoose.model('Tenant', tenantSchema);
