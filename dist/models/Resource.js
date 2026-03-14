import mongoose from 'mongoose';
const resourceSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    name: {
        type: String,
        required: [true, 'Please add a resource name'],
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['available', 'maintenance', 'out_of_order'],
        default: 'available'
    },
    quantity: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});
export default mongoose.model('Resource', resourceSchema);
