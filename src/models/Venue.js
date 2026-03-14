import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a venue name'],
    trim: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  address: {
    type: String
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  }
}, {
  timestamps: true
});

export default mongoose.model('Venue', venueSchema);
