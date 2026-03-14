import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Please add capacity']
    },
    facilities: [String],
    floor: String,
    images: [String]
}, {
    timestamps: true
});
export default mongoose.model('Room', roomSchema);
